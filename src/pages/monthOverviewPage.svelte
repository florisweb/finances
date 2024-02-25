<script>
	import { MonthIdentifier } from "../types";
	import { getContext }from 'svelte';
	import { formatMoneyString } from '../polyfill';

	import TagManager from '../data/tagManager';
	import TransactionManager from '../data/transactionManager.js';

	import Page from "../UI/page.svelte";
    import TagOverviewPanel from "../UI/tagOverviewPanel.svelte";
    import Button from '../UI/button.svelte';
    import BudgetManager from "../data/budgetManager";
    import { openPageByIndex } from "../App";
	

	let lastMonthDate = new Date();
	lastMonthDate.setDate(-1);
	export let curMonth = new MonthIdentifier().setFromDate(lastMonthDate);
	const App = getContext('App');
	
	let tags = [];
	let nonAssignedTransactions = [];
	let visibleTagsWithMetaData = [];


	let totalDelta = 0;
	function catagorizeTransactions() {
		visibleTagsWithMetaData = [];
		totalDelta = 0;
		for (let tag of tags)
		{
			let trans = tag.getTransactionsByMonth(curMonth);
			let income = trans.filter((t) => t.deltaMoney > 0).map(t => t.deltaMoney).reduce((a, b) => a + b, 0);
			let expenses = -trans.filter((t) => t.deltaMoney < 0).map(t => t.deltaMoney).reduce((a, b) => a + b, 0);
			if (tag.id === 0) nonAssignedTransactions = trans;
			
			if (income !== 0 || expenses !== 0)
			{
				visibleTagsWithMetaData.push({
					tag: tag,
					in: income,
					out: expenses,
					transactions: trans
				});
			}
			
			if (tag.isSavingsTag) continue;
			totalDelta += income - expenses;
		}
	}

	$: curMonth && catagorizeTransactions();
	TagManager.dataStore.subscribe((_tags) => {tags = Object.assign([], _tags); catagorizeTransactions()});
	TransactionManager.dataStore.subscribe(() => {catagorizeTransactions()});

	$: {
		visibleTagsWithMetaData.sort((a, b) => {
			let deltaA = Math.abs(a.in - a.out);
			let deltaB = Math.abs(b.in - b.out);
			return deltaA < deltaB;
		});
		visibleTagsWithMetaData = visibleTagsWithMetaData;
	}
</script>

<Page>
	<div class='infoHolder'>
		<div class='deltaHolder' class:negative={totalDelta < 0} class:positive={totalDelta > 0}>
			<img src={totalDelta > 0 ? 'images/arrowRisingIcon.png' : 'images/arrowFallingIcon.png'} class='deltaIcon' alt='Money change visualization.'>
			<div class="deltaMoney">{formatMoneyString(Math.abs(Math.round(totalDelta)), true, true)}</div>
		</div>	

		<div class='monthHolder'>
			<div>{curMonth.name}</div>
		</div>

		<div class="floatRightHolder">
			<div class={'buttonHolder' + (nonAssignedTransactions.length === 0 ? ' noAssignableTransactions' : '')}>
				<div class='buttonWrapper'>
					<Button name='Active Budget' on:click={() => {
						let budget = BudgetManager.getByMonth(curMonth);
						if (!budget) return openPageByIndex(3);
						App.createBudgetPopup.openEdit(budget);
					}}></Button>
				</div>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div class='buttonWrapper assignTransactions' on:click={() => {
					App.transactionViewerPopup.open(nonAssignedTransactions, `Assign ${nonAssignedTransactions.length} Transactions`);
				}}>
					<Button name={`assign ${nonAssignedTransactions.length} transactions`}></Button>
				</div>
			</div>

			<div class='navigationHolder'>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div class='navButton button filled' on:click={() => curMonth = new MonthIdentifier().setFromDate(curMonth.date.moveMonth(-1))}>‹</div> 
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div class='navButton button filled' on:click={() => curMonth = new MonthIdentifier().setFromDate(new Date().moveMonth(-1))}>PRESENT</div> 
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div class='navButton button filled' on:click={() => curMonth = new MonthIdentifier().setFromDate(curMonth.date.moveMonth(1))}>›</div> 
			</div>
		</div>
	</div>

	<div class='message' class:hide={visibleTagsWithMetaData.length} transit>
		No expenses in this month, add them via the 
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-missing-attribute -->
		<a style='color: #daf; cursor: pointer; font-style: italic' on:click={() => openPageByIndex(0)}>data manager.</a>
	</div>
	<div class='tagListHolder'>
		{#each visibleTagsWithMetaData as data}
			<TagOverviewPanel 
				{...data.tag} 
				income={data.in} 
				expenses={data.out} 
				totalSavings={data.tag.isSavingsTag ? data.tag.getSavingsAtEndOfMonth(curMonth) : -1}
				budget={data.tag.getBudgetInMonth(curMonth)}
				on:click={() => App.transactionViewerPopup.open(data.transactions, `${data.tag.name}'s Transactions`)}
			></TagOverviewPanel>
		{/each}
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


		.deltaHolder {
			position: relative;
			display: flex;
			margin-top: 6px;
			margin-right: 15px;
			
			height: 60px;
			flex-direction: row;
			background-color: #ccc;
			border-radius: 5px;
			padding: 0 10px;
			color: #fff;
		}
		
		.deltaHolder.positive {
			background-color: #3c3;
		}
		.deltaHolder.negative {
			background-color: #f00;
		}

		.deltaHolder .deltaIcon {
			height: 60px;
			padding: 10px 0;
			margin-right: 5px;
		}
		.deltaHolder .deltaMoney {
			position: relative;
			display: flex;
			height: 60px;
			
			line-height: 60px;
			font-style: italic;
			font-size: 30px;
		}






		.monthHolder {
			position: relative;
			display: flex;
			font-size: 40px;
			height: 70px;
			line-height: 70px;
			color: #333;
			font-style: italic;
			margin-right: 60px;
			padding-right: 20px;
		}
		


		.floatRightHolder {
			position: absolute;
			float: right;
			top: 15px;
			right: 0;
			height: 80px;
			display: flex;
		}
		
			.navigationHolder {
				position: relative;
				display: flex;
				white-space: nowrap;
				top: 25px;
				height: 37px;
				padding-left: 10px;
			}
			.navigationHolder .navButton {
				font-style: normal;
				cursor: pointer;
				font-size: 25px;
				margin-left: 5px;

				-webkit-touch-callout: none; /* iOS Safari */
				-webkit-user-select: none; /* Safari */
				-khtml-user-select: none; /* Konqueror HTML */
				-moz-user-select: none; /* Firefox */
					-ms-user-select: none; /* Internet Explorer/Edge */
						user-select: none; /* Non-prefixed version, currently
											supported by Chrome and Opera */
			}
			.navigationHolder .navButton:not(:nth-child(2)) {
				line-height: 14px;
			}
		
			.navigationHolder .navButton:nth-child(2) {
				font-size: 14px;
			}

		


			.buttonHolder {
				flex-direction: column;
			}
				.buttonHolder .buttonWrapper {
					margin-bottom: 5px;
					margin-top: 0;
					text-align: right;
					transition: .3s opacity, .3s margin-top;
				}
				.buttonHolder.noAssignableTransactions .buttonWrapper:not(.assignTransactions) {
					margin-top: 25px;
				}
				.buttonHolder.noAssignableTransactions .buttonWrapper.assignTransactions {
					opacity: 0;
					margin-top: -50px;
					pointer-events: none;
				}


	/* Tag List */
	.tagListHolder {
		position: relative;
		margin: 20px;

		display: grid;
		grid-template: repeat(10, auto) / repeat(3, calc((100% - 40px * 2) / 3));
		grid-gap: 40px;
	}





	.message {
		padding-top: 30px;
		margin-bottom: -20px;
		width: 100%;
		text-align: center;
		transition: opacity .3s, margin-top .3s;
	}
	.message.hide {
		opacity: 0;
		margin-top: -25px;
		pointer-events: none;
	}
</style>