<script>
	import Page from "../UI/page.svelte";
	import { MonthIdentifier, NonAssignedTag } from "../types";
	import TagManager from '../data/tagManager';
	import TransactionManager from "../data/transactionManager";
    import TagOverviewPanel from "../UI/tagOverviewPanel.svelte";

	export let curMonth = new MonthIdentifier();


	let tagsWithMetaData = {};
	let totalDelta = 0;
	window.tagsWithMetaData = tagsWithMetaData;

	$: {
		tagsWithMetaData = {};
		totalDelta = 0;
		for (let tag of tags)
		{
			let trans = tag.getTransactionsByMonth(curMonth);
			console.log('get', trans, tag);
			let income = trans.filter((t) => t.deltaMoney > 0).map(t => t.deltaMoney).reduce((a, b) => a + b, 0);
			let expenses = -trans.filter((t) => t.deltaMoney < 0).map(t => t.deltaMoney).reduce((a, b) => a + b, 0);
			console.log(tag, income, expenses);
			tagsWithMetaData[tag.id] = {
				in: income,
				out: expenses,
				transactions: trans
			}

			if (tag.isSavingsTag) continue;
			totalDelta = income - expenses;
		}
	}
	
	let tags = [];
	let nonAssignedTag = new NonAssignedTag();
	TagManager.dataStore.subscribe((_tags) => {
		tags = [...Object.assign([], _tags), nonAssignedTag]
	});

</script>

<Page>
	<div class='infoHolder'>
		<div class={'balanceHolder' + (totalDelta > 0 ? ' positive' : (totalDelta < 0 ? ' negative' : ''))}>{(totalDelta > 0 ? '+' : '') + Math.round(totalDelta)}</div>
		
		<div class='monthHolder'>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class='navButton' on:click={() => curMonth = new MonthIdentifier().setFromDate(curMonth.date.moveMonth(-1))}>‹</div> 
			<div>{curMonth.name}</div>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class='navButton' on:click={() => curMonth = new MonthIdentifier().setFromDate(curMonth.date.moveMonth(1))}>›</div> 
		</div>

		<div class='buttonHolder'>
			<div class='buttonWrapper'>
				<div class='button'>Budgetter</div>
			</div>
			<div class='buttonWrapper'>
				<div class='button'>assign {nonAssignedTag.getTransactionsByMonth(curMonth).length} transactions</div>
			</div>
		</div>

	</div>

	<div class='tagListHolder'>
		{#each tags as tag}
			<TagOverviewPanel {...tag} income={tagsWithMetaData[tag.id].in} expenses={tagsWithMetaData[tag.id].out} totalSavings={0}></TagOverviewPanel>
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
		.monthHolder .navButton {
			font-style: normal;
			color: #999;
			cursor: pointer;
			margin: -10px -5px;
			padding: 10px;
		}

	


		.buttonHolder {
			position: absolute;
			float: right;
			top: 15px;
			right: 0;
			display: flex;
			flex-direction: column;
		}
		.buttonHolder .buttonWrapper {
			margin-bottom: 5px;
			text-align: right;
		}
		.buttonWrapper .button {
			margin: 0;
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