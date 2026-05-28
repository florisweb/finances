<script>
	import Page from "../UI/page.svelte";	
	import Button from '../UI/button.svelte';
	import { formatMoneyString } from '../polyfill';

	import { openPageByIndex } from '../App';
	import { getContext } from 'svelte';
    import Graph from "../UI/graph.svelte";
	import UIFundTransaction from "../UI/UIFundTransaction.svelte";

    import Color from "../color";
    import AccountManager from "../data/accountManager";
    import { FundDividendTransaction, FundTransaction, MonthIdentifier, Transaction } from "../types";
    import Vector from "../vector";

	const App = getContext('App');
	let curAccount;
	App.accountPage = {
		open: (_account) => {
			curAccount = _account;
			openPageByIndex(5);
			isFundAccount = curAccount.isFundAccount;
		}
	};

	let curAccountBalance = 0;
	$: (async () => {
		curAccountBalance = await curAccount?.getBalance()
	})();

	let graphData = [];
	let prevAccount;
	$: (async () => {
		if (prevAccount === curAccount) return; // Prevent loops due to reactivity of async
		prevAccount = curAccount;
		let transactions = curAccount?.transactions || [];
		transactions.sort((a, b) => a.date > b.date);
		const firstDate = transactions[0]?.date || new Date();
		const monthRange = Math.ceil((new Date() - firstDate) / 1000 / 60 / 60 / 24 / 30); // Approx. 30 days per month

		graphData = [{
			color: new Color('#0f0'),
			name: 'Total',
			data: await curAccount?.generateGraphData(monthRange) || []
		}];

		if (!isFundAccount) return;
		let funds = await curAccount?.getFunds();
		for (let fundName in funds)
		{
			let fund = funds[fundName];
			let valueData = [];
			let investmentData = [];
			for (let delta = -monthRange - 1; delta < 0; delta++)
			{
				let curMonth = new MonthIdentifier().setFromDate(new Date().moveMonth(delta));
				
				valueData.push(new Vector(
					curMonth.date.copy().moveMonth(1).getTime(),
					await fund.getValueAtEndOfMonth(curMonth)
				));
				investmentData.push(new Vector(
					curMonth.date.copy().moveMonth(1).getTime(),
					await fund.getInvestmentAtEndOfMonth(curMonth)
				));
			}

			graphData.push({
				color: stringToColor(fund.name),
				name: fund.name,
				data: valueData
			});
			graphData.push({
				color: stringToColor(fund.name),
				dashStyle: [8, 5],
				name: '(inv)',
				data: investmentData
			});
		}
		graphData = graphData;
	})();

	
	let isFundAccount = false;
	let fundTransactions = [];
	let funds = {};
	let nonAllocatedFunds;
	let interest = 0;
	let serviceCosts = 0;
	$: if (curAccount?.isFundAccount) 
	{
		fundTransactions = curAccount.transactions.filter(t => t instanceof FundTransaction);
		fundTransactions.sort((a, b) => a.date < b.date);
		nonAllocatedFunds = curAccount.getCashValue();
		interest = curAccount.transactions.filter(t => t.isInterestTransaction).map(t => t.deltaMoney).reduce((a, b) => a + b, 0);
		serviceCosts = curAccount.serviceCostTransactions.map(r => r.deltaMoney).reduce((a, b) => a + b, 0);
		updateFunds();
	}

	async function updateFunds() {
		funds = await curAccount.getFunds()
		for (let fundName in funds)
		{
			funds[fundName].annualYield = await funds[fundName].calcAnnualYield();
		}
	}



	function stringToColor(_string) {
		let hash = 0;
		for (let i = 0; i < _string.length; i++) {
			hash = _string.charCodeAt(i) + ((hash << 4) - hash);
		}
		let col = new Color(`hsl(${hash % 360}, 40, 100)`);
		return col;
	}

</script>

<Page>
	<div class='infoHolder'>
		<div class='balanceHolder'>{formatMoneyString(curAccountBalance ?? 0, true, true)}</div>
		
		<div class='titleHolder'>
			<div>{curAccount?.name || 'Unnamed'}</div>
			<div class="subInfoHolder">{curAccount?.IBAN}</div>
		</div>

		<div class="floatRightHolder">
			<div class={'buttonHolder'}>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<Button name='Transactions' 
					on:click={
					() => App.transactionViewerPopup.open(curAccount?.transactions, `${curAccount?.name}'s Transactions`)
				}></Button>

				<Button name='Edit' 
					on:click={
					() => App.createAccountPopup.openEdit(curAccount)
				}></Button>
					<Button name='Remove' 
					on:click={
					() => {
						AccountManager.remove(curAccount?.id);
						openPageByIndex(4);
					}
				}></Button>
			</div>
		</div>
	</div>

	<div class='dataHolder'>
		<Graph title='Balance' data={graphData} maxWidth={365 * 24 * 60 * 60 * 1000}></Graph>


		{#if isFundAccount}
			<br style='margin-top: 50px'>

			<div class="fundOverviewHolder">
				{#each Object.keys(funds) as fund}
					<div class='fundPanel' style={`background: ` + stringToColor(fund).hex}>
						<div class="valueHolder">
							{formatMoneyString(funds[fund].value, true, true)}
							<div class="percHolder">{Math.round(funds[fund].annualYield * 1000) / 10}%/y</div>
						</div>
						<div class="title">{fund}</div>
						<div class="subInformation">
							Inv: {formatMoneyString(funds[fund].investment)} - Shares: {Math.round(funds[fund].shares * 100) / 100}<br>
							Profit: {formatMoneyString(funds[fund].value-funds[fund].investment)}
						</div>
						<div class='lastUpdatedText'>
							Stock price of: {funds[fund].lastUpdateTime}
						</div>
					</div>
				{/each}

				<div class='fundPanel nonAllocatedFunds'>
					<div class="valueHolder">
						{formatMoneyString(nonAllocatedFunds, true, true)}
					</div>
					<div class="title">Non-allocated funds</div>
					<div class="subInformation">
						Service costs: {formatMoneyString(-serviceCosts)}<br>
						Interest: {formatMoneyString(interest)}
					</div>
				</div>
			</div>



			<table class='transactionTable'>
				<thead>
					<tr class='header'>
						<th scope='col'>Date</th>
						<th scope='col'>Money</th>
						<th scope='col'>Shares</th>
						<th scope='col'>Price/share</th>
						<th scope='col'>Yield</th>
						<th scope='col'>Fund</th>
					</tr>
				</thead>
				<tbody>
					{#each fundTransactions as transaction}
						<UIFundTransaction {transaction}></UIFundTransaction>
					{/each}
				</tbody>
			</table>

		{/if}
	</div>
</Page>

<style>
	/* INFOHOLDER */
	.infoHolder {
		position: relative;
		display: flex;
		margin-left: 20px;
		width: calc(100% - 40px);
		height: auto;

		padding: 20px 0;
		border-bottom: 1px solid #ddd;
	}
		
		.balanceHolder {
			position: relative;
			font-size: 40px;
			height: 70px;
			line-height: 70px;
			color: #333;
			font-style: italic;
			padding-right: 20px;
		}
			.balanceHolder:before {
				content: 'BALANCE';
				position: absolute;
				top: 25px;
				right: 20px;
				font-size: 12px;
				white-space: nowrap;
			}



		.titleHolder {
			position: relative;
			display: flex;
			height: 70px;
			margin-right: 60px;
			padding-right: 20px;
			
			line-height: 70px;
			color: #333;
			font-style: italic;
			font-size: 40px;
			text-transform: uppercase;
		}
			.titleHolder .subInfoHolder {
				position: absolute;
				top: 25px;
				right: 25px;
				font-size: 12px;
				white-space: nowrap;
			}
		


	.dataHolder {
		position: relative;
		margin: 20px;
	}


	.floatRightHolder {
		position: absolute;
		float: right;
		top: 15px;
		right: 0;
		height: 80px;
		display: flex;
	}
	
		.buttonHolder {
			flex-direction: column;
			margin-top: 25px;
		}



	.fundOverviewHolder {
		display: flex;
		margin-bottom: 30px;
	}
	.fundOverviewHolder .fundPanel {
		position: relative;
		padding: 30px;
		padding-top: 20px;
		margin-right: 20px;

		width: 30vw;
		max-width: 300px;
		height: auto;

		background-color: #daf;
		box-shadow: 10px 10px 10px 10px rgba(0, 0, 0, 0.03);
		border-radius: 10px;
	}

	.fundOverviewHolder .fundPanel .valueHolder {
		color: #fff;
		position: relative;
		font-size: 16px;
		margin-bottom: 5px;
	}

	.fundOverviewHolder .fundPanel .valueHolder .percHolder {
		opacity: .5;
		font-size: 14px;
		line-height: 18px;
		float: right;
		margin-right: -10px;
	}

	.fundOverviewHolder .fundPanel .title {
		position: relative;
		font-size: 18px;
		color: #fff;
		margin-bottom: 15px;
	}

	.fundOverviewHolder .fundPanel .subInformation {
		color: #fff;
		opacity: .7;
		font-size: 13px;
	}
	.fundOverviewHolder .fundPanel .lastUpdatedText {
		position: absolute;
		right: 0;
		bottom: 0;
		padding: 10px;
		padding-right: 15px;

		text-align: right;
		color: rgba(255, 255, 255, .4);
		font-size: 10px;
	}

	.fundPanel.nonAllocatedFunds {
		background-color: transparent;
		border: 2px solid #daf;
	}

	.fundPanel.nonAllocatedFunds .title, .fundPanel.nonAllocatedFunds .subInformation, .fundPanel.nonAllocatedFunds .valueHolder {
		color: #daf;
	}





	.transactionTable {
		position: relative;
		overflow-y: auto;
		overflow-x: hidden;
		border-collapse: collapse;
	}

	th {
		position: relative;
		height: 20px;
		line-height: 20px;
		font-size: 13px;
		color: #444;
		text-align: left;
	}


	
</style>