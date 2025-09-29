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
	import { formatMoneyString } from '../polyfill';

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
			if (curTag.isSavingsTag) {
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
	}

	let yearOverviewData = [];
	$: if (curTag) {
		yearOverviewData = [];
		let firstYear = curTag.firstTransactionDate?.getFullYear();
		for (let y = new Date().getFullYear(); y >= firstYear; y--)
		{
			let expensesPerMonth = [];
			for (let m = 0; m < 12; m++)
			{
				expensesPerMonth[m] = {
					month: m + 1,
					expense: -curTag.getTransactionsByMonth(new MonthIdentifier().setFromId((m + 1) + '/' + y))
										.map(t => t.deltaMoney)
										.reduce((a, b) => a + b, 0)
				};
			}
			let yearData = {
				year: y,
				expenses: expensesPerMonth.map(r => r.expense).reduce((a, b) => a + b, 0),
				perMonth: expensesPerMonth,
			};
			if (curTag.isSavingsTag) yearData.savings = curTag.getSavingsAtEndOfMonth(new MonthIdentifier().setFromId('12/' + y));
			yearOverviewData.push(yearData);
		}
		yearOverviewData = yearOverviewData; // Update
	}

</script>

<Page title={curTag?.name}>
	<Button on:click={() => App.transactionViewerPopup.open(transactions)} name={`All transactions [${transactions.length}]`}></Button>
	<Button on:click={() => App.createTagPopup.openEdit(curTag)} name='Edit'></Button>
	<Button on:click={async () => {await TagManager.remove(curTag.id); openPageByIndex(1)}} name='Remove'></Button>
	<br>
	<Graph data={graphData} maxWidth={1000 * 60 * 60 * 24 * 365.25}></Graph>
	<br>
	<br>
	<div class='header'>Expenses</div>
	<table class='overviewTable'>
		<thead>
			<tr class='header'>
				<th scope='col' class='tableTitle'>Year</th>
				<th scope='col'>Total</th>
				{#if curTag?.isSavingsTag}
					<th scope='col'>
						Savings
						<p class='subText'>At year's end</p>
					</th>
				{/if}
				<th scope='col'>Jan</th>
				<th scope='col'>Feb</th>
				<th scope='col'>Mar</th>
				<th scope='col'>Apr</th>
				<th scope='col'>May</th>
				<th scope='col'>Jun</th>
				<th scope='col'>Jul</th>
				<th scope='col'>Aug</th>
				<th scope='col'>Sep</th>
				<th scope='col'>Oct</th>
				<th scope='col'>Nov</th>
				<th scope='col'>Dec</th>
			</tr>
		</thead>
		<tbody>
			{#each yearOverviewData as yearSet}
				<tr>
					<td class='year'>{yearSet.year}</td>
					<td class='totalSum moneyString'>
						<strong>
							{formatMoneyString(yearSet.expenses, true)}
						</strong>
					</td>
					{#if curTag?.isSavingsTag}
						<td class='savingsSum moneyString' class:hasNotFinishedYet={
							new MonthIdentifier().setFromId( '12/' + yearSet.year).date >= new Date().setDate(0)
						}>
							{formatMoneyString(yearSet.savings, true)}
						</td>
					{/if}
					{#each yearSet.perMonth as monthSet}
						<td class='monthSum moneyString' class:hasNotFinishedYet={
							new MonthIdentifier().setFromId(monthSet.month + '/' + yearSet.year).date >= new Date().setDate(0)
						}>{monthSet.expense !== 0 ? formatMoneyString(monthSet.expense, false) : '-'}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</Page>


<style>
	.overviewTable {
		position: relative;
		overflow-y: auto;
		overflow-x: hidden;
		border-collapse: collapse;
		margin-top: 10px;
		width: 100%;
	}

	th {
		position: relative;
		height: 35px;
		line-height: 25px;
		font-size: 13px;
		color: #444;
		text-align: left;
	}
	td {
		font-size: 12px;
	}
	tr {
		height: 30px;
	}
	td.monthSum {
		color: #555;
	}
	.hasNotFinishedYet {
		font-style: italic;
		color: #888 !important;
	}

	.subText {
		position: absolute;
		font-size: 9px;
		color: #888;
		line-height: 10px;
		margin-top: -2px;
	}
</style>