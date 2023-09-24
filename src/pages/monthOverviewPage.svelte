<script>
	import { MonthIdentifier } from "../types";
	import { getContext }from 'svelte';
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
	let tagsWithMetaData = {};
	let nonAssignedTransactions = [];

	let totalDelta = 0;
	function catagorizeTransactions() {
		tagsWithMetaData = {};
		totalDelta = 0;
		for (let tag of tags)
		{
			let trans = tag.getTransactionsByMonth(curMonth);
			let income = trans.filter((t) => t.deltaMoney > 0).map(t => t.deltaMoney).reduce((a, b) => a + b, 0);
			let expenses = -trans.filter((t) => t.deltaMoney < 0).map(t => t.deltaMoney).reduce((a, b) => a + b, 0);
			tagsWithMetaData[tag.id] = {
				in: income,
				out: expenses,
				transactions: trans
			}
			if (tag.id === 0) nonAssignedTransactions = trans;
			if (tag.isSavingsTag) continue;
			totalDelta += income - expenses;
		}
	}

	$: curMonth && catagorizeTransactions();
	TagManager.dataStore.subscribe((_tags) => {tags = Object.assign([], _tags); catagorizeTransactions()});
	TransactionManager.dataStore.subscribe(() => {catagorizeTransactions()});



	$: {
		tags.sort((_tagA, _tagB) => {
			let deltaA = Math.abs(tagsWithMetaData[_tagA.id].in - tagsWithMetaData[_tagA.id].out);
			let deltaB = Math.abs(tagsWithMetaData[_tagB.id].in - tagsWithMetaData[_tagB.id].out);
			return deltaA < deltaB;
		})
		tags = tags;
	}
</script>

<Page>
	<div class='infoHolder'>
		<div class={'balanceHolder' + (totalDelta > 0 ? ' positive' : (totalDelta < 0 ? ' negative' : ''))}>{(totalDelta > 0 ? '+' : '') + Math.round(totalDelta)}</div>
		
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

	<div class='tagListHolder'>
		{#each tags as tag}
			{#if (tagsWithMetaData[tag.id].in !== 0 || tagsWithMetaData[tag.id].out !== 0)}
				<TagOverviewPanel 
					{...tag} 
					income={tagsWithMetaData[tag.id].in} 
					expenses={tagsWithMetaData[tag.id].out} 
					totalSavings={tag.isSavingsTag ? tag.getSavingsAtStartOfMonth(curMonth) : -1}
					budget={tag.getBudgetInMonth(curMonth)}
					on:click={() => App.transactionViewerPopup.open(tagsWithMetaData[tag.id].transactions, `${tag.name}'s Transactions`)}
				></TagOverviewPanel>
			{/if}
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
		
		.balanceHolder {
			position: relative;
			font-size: 40px;
			height: 70px;
			line-height: 70px;
			color: #333;
			font-style: italic;
			padding-right: 20px;
		}
		.balanceHolder.positive {
			color: #383;
		}
		.balanceHolder.negative {
			color: #833;
		}

			.balanceHolder:before {
				content: 'CHANGE';
				position: absolute;
				top: 25px;
				right: 20px;
				font-size: 12px;
				white-space: nowrap;
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


</style>