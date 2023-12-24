<script>
	import Button from "../UI/button.svelte";
	import Page from "../UI/page.svelte";
	import { openPageByIndex } from '../App';
	import { getContext } from 'svelte';
    import TagManager from "../data/tagManager";
	import { AvailableColors } from '../color';
	import Vector from '../vector';
    import Graph from "../UI/graph.svelte";
    import { MonthIdentifier } from "../types";
    import { wait } from "../polyfill";

	const App = getContext('App');


	let curTag;
	App.tagPage = {
		open: (_tag) => {
			curTag = _tag;
			openPageByIndex(6);
		}
	};

	let transactions = [];
	$: transactions = curTag?.transactions ?? [];



	let graphData = [];
	$: if (curTag) {
		graphData = [{
			color: AvailableColors[0].color,
			data: [],
		}];
		if (curTag.isSavingsTag)
		{
			let firstTransaction = curTag.transactions[0];
			let firstTransactionDate = firstTransaction?.date || new Date();

			let curMonth = new MonthIdentifier().setFromDate(firstTransactionDate);
			while (curMonth.date.getTime() < new MonthIdentifier().date.getTime())
			{	
				console.log(curMonth.id);
				graphData[0].data.push(new Vector(
					curMonth.date.getTime(),
					curTag.getSavingsAtStartOfMonth(curMonth)
				));
				curMonth = new MonthIdentifier().setFromDate(curMonth.date.moveMonth(1))
			}
		}
	}


</script>

<Page title={curTag?.name}>
	<Button on:click={() => App.transactionViewerPopup.open(transactions)} name={`All transactions [${transactions.length}]`}></Button>
	<Button on:click={() => App.createTagPopup.openEdit(curTag)} name='Edit'></Button>

	<Graph data={graphData} maxWidth={1000 * 60 * 60 * 24 * 365.25}></Graph>
</Page>