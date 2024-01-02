<script>
	import Page from "../UI/page.svelte";	
	import AccountManager from "../data/accountManager";
	import { formatMoneyString } from '../polyfill';
    import { MonthIdentifier } from "../types";
    import PieChart from "../UI/pieChart.svelte";
    import TagManager from "../data/tagManager";
    import Tag from "../UI/tag.svelte";


	let curDate = new Date();
	curDate.setDate(0);
	let curMonth = new MonthIdentifier().setFromDate(curDate);
	window.setCurMonth = (m) => curMonth = m;

	let curBalance = 0;
	$: if (accounts) curBalance = AccountManager.getBalanceAtEndOfMonth(curMonth);


	let accounts = [];
	AccountManager.dataStore.subscribe((_accounts) => accounts = _accounts);
	// let graphData = [{color: AvailableColors[0].color, data: [], doNotInterpolate: false}]
	// $: if (accounts.length) {
	// 	for (let i = 1; i < accounts.length + 1; i++)
	// 	{
	// 		graphData[i] = {
	// 			color: AvailableColors[i].color,
	// 			data: accounts[i - 1].generateGraphData(23) || [],
	// 			doNotInterpolate: true,
	// 		}
	// 	}

	// 	for (let d = 0; d < graphData[1].data.length; d++)
	// 	{
	// 		graphData[0].data[d] = new Vector(graphData[1].data[d].value[0], 0);
	// 		for (let i = 1; i < accounts.length + 1; i++)
	// 		{	
	// 			graphData[0].data[d].value[1] += graphData[i].data[d].value[1];
	// 		}
	// 	}
	// }



	let tags = [];
	TagManager.dataStore.subscribe((_tags) => tags = _tags);

	let incomeTagData = [];
	let expensesTagData = [];
	$: {
		incomeTagData = [];
		expensesTagData = [];
		for (let tag of tags)
		{
			let expenses = tag.getAverageExpensesInLastXMonths(12);
			if (expenses > 0)
			{
				incomeTagData.push({
					tag: tag,
					expenses: expenses,
				})
			} else {
				expensesTagData.push({
					tag: tag,
					expenses: expenses,
				})
			}
		}
		incomeTagData.sort((a, b) => Math.abs(a.expenses) < Math.abs(b.expenses))
		expensesTagData.sort((a, b) => Math.abs(a.expenses) < Math.abs(b.expenses))
	}






	let balanceDistributionData = [];
	let reservedMoney = 0;

	$: {
		reservedMoney = 0;
		let savingTags = tags.filter((_tag) => _tag.isSavingsTag);
		balanceDistributionData = [
			{value: 0, color: '#f00', name: 'Indebted'}
		];

		for (let i = 0; i < savingTags.length; i++)
		{
			let balance = savingTags[i].getSavingsAtEndOfMonth(curMonth);
			if (balance < 0) {
				balanceDistributionData[0].value -= balance;
				continue;
			};

			reservedMoney += balance;			
			balanceDistributionData.push(
				{
					value: balance,
					color: savingTags[i].color.hex,
					name: moneyNameAndValueToString(savingTags[i].name, balance)
				}
			)
		}
		balanceDistributionData[0].name = moneyNameAndValueToString('Indebted', -balanceDistributionData[0].value);
		balanceDistributionData.sort((a, b) => a.value < b.value);
	}


	let expensesData = [];
	let incomeData = [];

	let averageExpenses = 0;
	let averageIncome = 0;
	$: {
		averageExpenses = 0;
		averageIncome = 0;

		incomeData = [];
		expensesData = [];
		for (let tag of tags)
		{
			let expenses = tag.getAverageExpensesInLastXMonths(12);
			if (expenses > 0)
			{
				averageExpenses += expenses;
				expensesData.push({
					value: expenses,
					color: tag.color.hex,
					name: moneyNameAndValueToString(tag.name, expenses)
				});
			} else {
				averageIncome -= expenses;
				incomeData.push({
					value: -expenses,
					color: tag.color.hex,
					name: moneyNameAndValueToString(tag.name, -expenses)
				});
			}
		}

		incomeData.sort((a, b) => a.value < b.value);
		expensesData.sort((a, b) => a.value < b.value);
	}



	function moneyNameAndValueToString(_name, _value) {
		return [_name, formatMoneyString(_value, true, true)];
	}


</script>

<Page customClass='overviewPage'>
	<div class='infoHolder'>	
		<div class='deltaHolder' class:negative={averageIncome < averageExpenses} class:positive={averageIncome > averageExpenses}>
			<img src={averageIncome > averageExpenses ? 'images/arrowRisingIcon.png' : 'images/arrowFallingIcon.png'} class='deltaIcon'>
			<div class="deltaMoney">{formatMoneyString(Math.abs(averageIncome - averageExpenses), true, true)}</div>
		</div>	
		<div class='titleHolder'>
			<div>{formatMoneyString(curBalance, true, true)} Balance</div>
			<div class="subInfoHolder">at end of {curMonth.id}</div>
		</div>
	</div>

	<div class='dataHolder'>
		<div class='section distribution'>
			<PieChart 
				title={'Income ' + formatMoneyString(averageIncome, true, true)} 
				data={incomeData}
				customClass='distributionGraph'
			></PieChart>
			<PieChart 
				title={'Expenses ' + formatMoneyString(averageExpenses, true, true)} 
				data={expensesData}
				customClass='distributionGraph'
			></PieChart>
			<PieChart 
				title={'Reserved Money ' + formatMoneyString(reservedMoney, true, true)}
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
						<th scope='col'>Average</th>
						<th scope='col'>Budgeted</th>
						<th scope='col'>Savings</th>
					</tr>
				</thead>
				<tbody>
					<div>Expenses</div>
					{#each incomeTagData as tagData}
						<tr>
							<td><Tag {...tagData.tag}></Tag></td>
							<td class='moneyString'>{formatMoneyString(tagData.expenses, true)}</td>
							<td class='moneyString'>{tagData.tag.getBudgetInMonth(curMonth) !== 0 ? formatMoneyString(-tagData.tag.getBudgetInMonth(curMonth), true) : '-'}</td>
							<td class='moneyString'>{tagData.tag.isSavingsTag ? formatMoneyString(tagData.tag.getSavingsAtEndOfMonth(curMonth), true) : '-'}</td>
						</tr>	
					{/each}
					<hr>
					<div>Income</div>
					{#each expensesTagData as tagData}
						<tr>
							<td><Tag {...tagData.tag}></Tag></td>
							<td class='moneyString'>{formatMoneyString(tagData.expenses, true)}</td>
							<td class='moneyString'>{tagData.tag.getBudgetInMonth(curMonth) !== 0 ? formatMoneyString(-tagData.tag.getBudgetInMonth(curMonth), true) : '-'}</td>
							<td class='moneyString'>{tagData.tag.isSavingsTag ? formatMoneyString(tagData.tag.getSavingsAtEndOfMonth(curMonth), true) : '-'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="section budget">
			<!-- <div class='sectionHeader'>Property</div> -->
			<!-- <Graph data={graphData}></Graph> -->
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
			margin-right: 10px;
			
			line-height: 70px;
			color: #333;
			font-style: italic;
			font-size: 40px;
			text-transform: uppercase;
		}
			.titleHolder .subInfoHolder {
				position: absolute;
				top: 25px;
				right: 0;
				font-size: 12px;
				white-space: nowrap;
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
			height: 50px;
			
			line-height: 45px;
			font-style: italic;
			font-size: 30px;
		}

		.deltaHolder .deltaMoney:before {
			content: 'PER MONTH';
			position: absolute;
			top: 25px;
			right: 2px;
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


	.dataHolder .section.distribution {
		grid-area: distribution;
		display: flex;
		border-bottom: 1px solid #eee;
	}
</style>