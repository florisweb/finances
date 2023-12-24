<script>
	import Page from "../UI/page.svelte";	
	import Graph from "../UI/graph.svelte";
	import AccountManager from "../data/accountManager";
	import { AvailableColors } from '../color';
	import { formatMoneyString } from '../polyfill';
	import Vector from "../vector";
    import { MonthIdentifier } from "../types";
    import PieChart from "../UI/pieChart.svelte";
    import TagManager from "../data/tagManager";
    import Tag from "../UI/tag.svelte";


	let curDate = new Date();
	curDate.setDate(0);
	let curMonth = new MonthIdentifier().setFromDate(curDate);

	let curBalance = 0;
	$: if (accounts) curBalance = AccountManager.getBalanceAtEndOfMonth(curMonth);


	let accounts = [];
	AccountManager.dataStore.subscribe((_accounts) => accounts = _accounts);
	let graphData = [{color: AvailableColors[0].color, data: [], doNotInterpolate: false}]
	$: if (accounts.length) {
		for (let i = 1; i < accounts.length + 1; i++)
		{
			graphData[i] = {
				color: AvailableColors[i].color,
				data: accounts[i - 1].generateGraphData(23) || [],
				doNotInterpolate: true,
			}
		}

		for (let d = 0; d < graphData[1].data.length; d++)
		{
			graphData[0].data[d] = new Vector(graphData[1].data[d].value[0], 0);
			for (let i = 1; i < accounts.length + 1; i++)
			{	
				graphData[0].data[d].value[1] += graphData[i].data[d].value[1];
			}
		}
	}



	let tags = [];
	TagManager.dataStore.subscribe((_tags) => tags = _tags);
	let balanceDistributionData = [];

	$: {
		let savingTags = tags.filter((_tag) => _tag.isSavingsTag);
		balanceDistributionData = [
			{value: 0, color: '#f00', name: 'Indebted'}
		];

		for (let i = 0; i < savingTags.length; i++)
		{
			let balance = savingTags[i].getSavingsAtStartOfMonth(curMonth);
			if (balance < 0) {
				balanceDistributionData[0].value -= balance;
				continue;
			};

			let name = savingTags[i].name;
			if (name.length > 10) name = name.substring(0, 10) + '...';
			balanceDistributionData.push(
				{
					value: balance,
					color: savingTags[i].color.hex,
					name: name + ' ' + formatMoneyString(balance, true, true)
				}
			)
		}

		balanceDistributionData.sort((a, b) => a.value < b.value);
	}


	let expensesData = [];
	$: {
		expensesData = [];
		for (let tag of tags)
		{
			let expenses = tag.averageExpensesLast12Months;
			if (expenses < 0) continue;
			expensesData.push({
				value: expenses,
				color: tag.color.hex,
				name: tag.name + ' ' + formatMoneyString(expenses, true, true)
			});
		}

		expensesData.sort((a, b) => a.value < b.value);
	}

	let incomeData = [];
	$: {
		incomeData = [];
		for (let tag of tags)
		{
			let income = -tag.averageExpensesLast12Months;
			if (income < 0) continue;
			incomeData.push({
				value: income,
				color: tag.color.hex,
				name: tag.name + '\n' + formatMoneyString(income, true, true)
			});
		}

		incomeData.sort((a, b) => a.value < b.value);
	}



</script>

<Page customClass='overviewPage'>
	<div class='infoHolder'>		
		<div class='titleHolder'>
			<div>{formatMoneyString(curBalance, true, true)} Balance</div>
			<div class="subInfoHolder">at end of {curMonth.id}</div>
		</div>
	</div>

	<div class='dataHolder'>
		<div class='section distribution'>
			<div class='sectionHeader'>Overview</div>
			<PieChart 
				title={'Income ' + formatMoneyString(incomeData.map(r => r.value).reduce((a, b) => a + b, 0), true, true)} 
				data={incomeData}
				customClass='distributionGraph'
			></PieChart>
			<PieChart 
				title={'Expenses ' + formatMoneyString(expensesData.map(r => r.value).reduce((a, b) => a + b, 0), true, true)} 
				data={expensesData}
				customClass='distributionGraph'
			></PieChart>
			<PieChart 
				title={'Reserved Money ' + formatMoneyString(balanceDistributionData.map(r => r.value).reduce((a, b) => a + b, 0), true, true)}
				data={balanceDistributionData}
				customClass='distributionGraph'
			></PieChart>
		</div>

		<div class="section tags">
			<div class='sectionHeader'>Tags</div>
			<table class='tagTable'>
				<thead>
					<tr class='header'>
						<th scope='col'></th>
						<th scope='col'>Expenses</th>
						<th scope='col'>Budget</th>
						<th scope='col'>Savings</th>
					</tr>
				</thead>
				<tbody>
					{#each tags as tag}
						<tr>
							<td><Tag {...tag}></Tag></td>
							<td class='moneyString'>{formatMoneyString(tag.averageExpensesLast12Months, true)}</td>
							<td class='moneyString'>{tag.getBudgetInMonth(curMonth) !== 0 ? formatMoneyString(-tag.getBudgetInMonth(curMonth), true) : '-'}</td>
							<td class='moneyString'>{tag.isSavingsTag ? formatMoneyString(tag.getSavingsAtStartOfMonth(curMonth), true) : '-'}</td>
						</tr>	
					{/each}
				</tbody>
			</table>
		</div>
		<div class="section budget">
			<div class='sectionHeader'>Property</div>
			<Graph data={graphData}></Graph>
		</div>
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


	.dataHolder {
		padding-top: 20px;

		display: grid;
		grid-template: 
			'distribution distribution'
			'tags savings'
			'tags budget';
		grid-template-columns: 50% 50%;
	}

	.dataHolder .section {
	}
	.dataHolder .section > .sectionHeader {
		position: relative;
		text-transform: uppercase;
	}









	.dataHolder .section.savings {
		grid-area: savings;
	}
	
	
	
	.dataHolder .section.tags {
		grid-area: tags;
	}
		.section.tags .tagTable {
			font-size: 13px;
		}	
		.section.tags .tagTable.header th {
			font-size: 13px;
		}
		


	.dataHolder .section.budget {
		grid-area: budget;
	}


	.dataHolder .section.distribution > .sectionHeader {
		position: absolute;
	}
	.dataHolder .section.distribution {
		grid-area: distribution;
		display: flex;
		border-bottom: 1px solid #eee;
	}
</style>