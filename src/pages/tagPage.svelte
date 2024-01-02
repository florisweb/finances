<script>
	import Button from "../UI/button.svelte";
	import Page from "../UI/page.svelte";
	import { openPageByIndex } from '../App';
	import { getContext } from 'svelte';
    import TagManager from "../data/tagManager";
	import { AvailableColors } from '../color';
	import Color from '../color';
	import Vector from '../vector';
    import Graph from "../UI/graph.svelte";
    import { MonthIdentifier } from "../types";

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
		}, { // Expenses
			color: new Color('#f00'),
			data: [],
			doNotInterpolate: true,
		}, { // Income
			color: new Color('#0a0'),
			data: [],
			doNotInterpolate: true,
		}];

		let firstTransactionDate = curTag.firstTransactionDate || new Date();
		let curMonth = new MonthIdentifier().setFromDate(firstTransactionDate);
		while (curMonth.date.getTime() < new MonthIdentifier().date.getTime())
		{	
			if (curTag.isSavingsTag) {;
				graphData[0].data.push(new Vector(
					curMonth.date.getTime(),
					curTag.getSavingsAtEndOfMonth(curMonth)
				));
			}

			let moneyTransactions = curTag.getTransactionsByMonth(curMonth).map((_transaction) => _transaction.deltaMoney);
			let expenses = 0;
			let income = 0;
			for (let expense of moneyTransactions)
			{
				if (expense < 0) 
				{
					expenses -= expense;
				} else income += expense
			}

			graphData[1].data.push(new Vector(curMonth.date.getTime(), expenses));
			graphData[2].data.push(new Vector(curMonth.date.getTime(), income));

			curMonth = new MonthIdentifier().setFromDate(curMonth.date.moveMonth(1))
		}
		console.warn(window.d = graphData);
	}


</script>

<Page title={curTag?.name}>
	<Button on:click={() => App.transactionViewerPopup.open(transactions)} name={`All transactions [${transactions.length}]`}></Button>
	<Button on:click={() => App.createTagPopup.openEdit(curTag)} name='Edit'></Button>
	<Button on:click={async () => {await TagManager.remove(curTag.id); openPageByIndex(1)}} name='Remove'></Button>

	<Graph data={graphData} maxWidth={1000 * 60 * 60 * 24 * 365.25}></Graph>
</Page>