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
    import { FundTransaction, Transaction } from "../types";

	const App = getContext('App');
	let curAccount;
	App.accountPage = {
		open: (_account) => {
			curAccount = _account;
			openPageByIndex(5);
			isFundAccount = curAccount.isFundAccount;
			console.log('is', isFundAccount);
		}
	};


	let graphData = [];
	$: {
		graphData = [{
			color: new Color('#0f0'),
			data: curAccount?.generateGraphData(11) || []
		}];
	}

	
	let isFundAccount = false;
	let fundTransactions = [];
	let funds = {};
	let nonAllocatedFunds;
	$: if (curAccount?.isFundAccount) 
	{
		fundTransactions = curAccount.transactions.filter(t => t instanceof FundTransaction);
		fundTransactions.sort((a, b) => a.date < b.date);
		let nonFundTransactions = curAccount.transactions.filter(t => t instanceof Transaction);
		funds = curAccount.getFunds();
		for (let fund in funds)
		{
			let lastTransaction = funds[fund].sort((a, b) => a.date < b.date)[0];
			let curSharePrice = lastTransaction?.sharePriceAtTimeOfTransaction || 0;

			funds[fund].shares = funds[fund].map(r => r.shares).reduce((a, b) => a + b, 0);
			funds[fund].investment = funds[fund].map(r => r.deltaMoney).reduce((a, b) => a + b, 0);
			console.log(funds[fund].investment);
			funds[fund].value = funds[fund].shares * curSharePrice;
		}

		nonAllocatedFunds = nonFundTransactions.map(r => r.deltaMoney).reduce((a, b) => a + b, 0);
	}
</script>

<Page>
	<div class='infoHolder'>
		<div class='balanceHolder'>{formatMoneyString(curAccount?.balance ?? 0, true, true)}</div>
		
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
		<Graph title='Balance' data={graphData}></Graph>


		


		{#if isFundAccount}
			<br style='margin-top: 50px'>

			<div class="fundOverviewHolder">
				{#each Object.keys(funds) as fund}
					<div class='fundPanel'>
						<div class="title">{fund}</div>
						<div class="subInformation">
							Shares: {Math.round(funds[fund].shares * 100) / 100} - Value: {formatMoneyString(funds[fund].value)} <br>
							Inv: {formatMoneyString(-funds[fund].investment)} - Profit: {formatMoneyString(funds[fund].value+funds[fund].investment)}
						</div>
					</div>
				{/each}

				<div class='fundPanel nonAllocatedFunds'>
					<div class="title">Non-allocated funds</div>
					<div class="subInformation">
						Value: {formatMoneyString(nonAllocatedFunds)}
					</div>
				</div>
			</div>



			<table class='transactionTable'>
				<thead>
					<tr class='header'>
						<th scope='col'>Date</th>
						<th scope='col'>Money</th>
						<th scope='col'>Shares</th>
						<th scope='col'>Price per share</th>
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
		margin-right: 30px;

		width: 30vw;
		max-width: 300px;
		height: auto;

		background-color: #daf;
		box-shadow: 10px 10px 10px 10px rgba(0, 0, 0, 0.03);
		border-radius: 10px;
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

	.fundPanel.nonAllocatedFunds {
		background-color: transparent;
		border: 2px solid #daf;
	}

	.fundPanel.nonAllocatedFunds .title, .fundPanel.nonAllocatedFunds .subInformation {
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