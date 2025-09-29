<script>
	import Page from "../UI/page.svelte";	
	import { formatMoneyString } from '../polyfill';

	import { getContext } from 'svelte';
    import Graph from "../UI/graph.svelte";

    import Color from "../color";
    import AccountManager from "../data/accountManager";
    import { FundTransaction, MonthIdentifier, Transaction } from "../types";
    import Vector from "../vector";
    import TransactionManager from "../data/transactionManager";

	let isOpen = false;

	let funds = [];
	let accounts = [];
	AccountManager.dataStore.subscribe(async () => {
		funds = await AccountManager.getFunds();
		accounts = AccountManager.data;
	});

	let graphData = [];
	$: if (isOpen) generateGraphData();



	let cashValue = 0;
	$: cashValue = accounts.map(r => r.getCashValue()).reduce((a, b) => a + b, 0);

	let totalValue = 0;
	$: totalValue = cashValue + funds.map(r => r.value).reduce((a, b) => a + b, 0);


	function getCashAtEndOfMonth(_monthId) {
		return accounts.map(r => r.getCashValueAtEndOfMonth(_monthId)).reduce((a, b) => a + b, 0);
	}

	async function generateGraphData() {
		const firstDate = TransactionManager.data[0]?.date || new Date();
		const monthRange = Math.ceil((new Date() - firstDate) / 1000 / 60 / 60 / 24 / 30); // Approx. 30 days per month

		let cashData = [];
		let totalData = [];
		let fundData = [];
		for (let delta = -monthRange - 1; delta < 0; delta++)
		{
			let curMonth = new MonthIdentifier().setFromDate(new Date().moveMonth(delta));
			let curCash = getCashAtEndOfMonth(curMonth);
			let time = curMonth.date.copy().moveMonth(1).getTime();
			cashData.push(new Vector(time, curCash || 0))
			let totalMoney = curCash;
			for (let i = 0; i < funds.length; i++)
			{
				if (!fundData[i]) fundData[i] = [];
				let value = await funds[i].getValueAtEndOfMonth(curMonth);
				fundData[i].push(new Vector(time, value || 0))
				totalMoney += value;
			}
			totalData.push(new Vector(time, totalMoney || 0))
		}
		graphData = [
			{
				color: new Color('#0f0'),
				name: 'Total',
				data: totalData
			}, {
				color: new Color('#f00'),
				name: 'Cash',
				data: cashData
			},
			...funds.map((f, i) => {return {
				color: stringToColor(f.name),
				name: f.name,
				data: fundData[i] || []
			}})
		];
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

<Page bind:isOpen={isOpen}>
	<div class='infoHolder'>
		<div class='balanceHolder'>{formatMoneyString(totalValue ?? 0, true, true)}</div>
		<div class='titleHolder'>
			<div>Portfolio</div>
			<!-- <div class="subInfoHolder">{curAccount?.IBAN}</div> -->
		</div>

		<div class="floatRightHolder">
			<div class={'buttonHolder'}>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- <Button name='Transactions' 
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
				}></Button> -->
			</div>
		</div>
	</div>

	<div class='dataHolder'>
		<div class="fundOverviewHolder">
			<div class='fundPanel nonAllocatedFunds'>
				<div class="valueHolder">
					{formatMoneyString(cashValue, true, true)}
					<div class="percHolder">{Math.round(cashValue / totalValue * 100)}%</div>
				</div>
				<div class="title">Cash</div>
				<div class="subInformation">
					Value: {formatMoneyString(cashValue)}
				</div>
			</div>

			{#each funds as fund}
				<div class='fundPanel' style={`background: ` + stringToColor(fund.name).hex}>
					<div class="valueHolder">
						{formatMoneyString(fund.value, true, true)}
						<div class="percHolder">{Math.round(fund.value / totalValue * 100)}%</div>
					</div>
					
					<div class="title">{fund.name}</div>
					<div class="subInformation">
						Inv: {formatMoneyString(fund.investment)} - Profit: {formatMoneyString(fund.value - fund.investment)}
					</div>
					<div class='lastUpdatedText'>
						Stock price of: { fund.lastUpdateTime}
					</div>
				</div>
			{/each}
		</div>

		<Graph title='Balance' data={graphData} maxWidth={1.5 * 365 * 24 * 60 * 60 * 1000}></Graph>
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
		color: #fff;
	}
	.fundOverviewHolder .fundPanel .valueHolder {
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

	.fundPanel.nonAllocatedFunds {
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