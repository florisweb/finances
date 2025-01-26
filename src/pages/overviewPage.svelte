<script>
	import { formatMoneyString } from '../polyfill';
	import { getContext } from 'svelte'
    import { MonthIdentifier, NonAssignedTag } from "../types";
    
	import AccountManager from "../data/accountManager";
	import TagManager from "../data/tagManager";
	import TransactionManager from "../data/transactionManager";

	import Page from "../UI/page.svelte";	
	import PieChart from "../UI/pieChart.svelte";
	import Button from '../UI/button.svelte';
    import Tag from "../UI/tag.svelte";
	

	const App = getContext('App')
	
	let curMonth = new MonthIdentifier().setFromDate((() => {
		let curDate = new Date();
		curDate.setDate(0);
		return curDate
	})());



	let accounts = [];
	AccountManager.dataStore.subscribe((_accounts) => accounts = _accounts);

	let curBalance = 0;
	$: (async () => {
		if (accounts) curBalance = await AccountManager.getBalanceAtEndOfMonth(curMonth);
	})();

	let nonAssignedTransactions = [];
	TransactionManager.dataStore.subscribe(() => {nonAssignedTransactions = new NonAssignedTag().transactions});
	
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
			if (expenses < 0)
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
		balanceDistributionData = [];
		let debts = [];

		for (let i = 0; i < savingTags.length; i++)
		{
			let balance = savingTags[i].getSavingsAtEndOfMonth(curMonth);
			if (balance < 0) {
				debts.push({value: -balance, color: '#f00', name: moneyNameAndValueToString(savingTags[i].name, balance)})
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

		balanceDistributionData.sort((a, b) => a.value < b.value);
		debts.sort((a, b) => a.value < b.value);
		balanceDistributionData = [...balanceDistributionData, ...debts];
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
			let expenses = tag.getAverageExpensesInLastXMonths(12, false);
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

		<div class="floatRightHolder">
			<div class={'buttonHolder' + (nonAssignedTransactions.length === 0 ? ' noAssignableTransactions' : '')}>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div class='buttonWrapper' on:click={() => {
					App.transactionViewerPopup.open(nonAssignedTransactions, `Assign ${nonAssignedTransactions.length} Transactions`);
				}}>
					<Button name={`assign ${nonAssignedTransactions.length} transactions`}></Button>
				</div>
			</div>
		</div>

	</div>

	<div class='dataHolder'>
		<div class='section distribution'>
			<PieChart 
				title={'Expenses ' + formatMoneyString(averageExpenses, true, true)} 
				subTitle={'12 month average'} 
				data={expensesData}
				customClass='distributionGraph'
			></PieChart>
			<PieChart 
				title={'Income ' + formatMoneyString(averageIncome, true, true)} 
				subTitle={'12 month average'} 
				data={incomeData}
				customClass='distributionGraph'
			></PieChart>
			<PieChart 
				title={'Reserved Money ' + formatMoneyString(reservedMoney, true, true)}
				subTitle={''} 
				data={balanceDistributionData}
				customClass='distributionGraph'
			></PieChart>
		</div>


		<div class="section expensesTags">
			<table class='tagTable'>
				<thead>
					<tr class='header'>
						<th scope='col' class='tableTitle'>Expenses</th>
						<th scope='col'>Average</th>
						<th scope='col'>Budgeted</th>
						<th scope='col'>Savings</th>
					</tr>
				</thead>
				<tbody>
					{#each expensesTagData as tagData}
						<tr>
							<td><Tag {...tagData.tag}></Tag></td>
							<td class='moneyString'>{formatMoneyString(tagData.expenses, true)}</td>
							<td class='moneyString' class:placeholder={tagData.tag.getBudgetInMonth(curMonth) === 0}>{
								tagData.tag.getBudgetInMonth(curMonth) !== 0 ? formatMoneyString(-tagData.tag.getBudgetInMonth(curMonth), true) : '-'
							}</td>
							<td class='moneyString' class:negative={tagData.tag.isSavingsTag && tagData.tag.getSavingsAtEndOfMonth(curMonth) < 0} class:placeholder={!tagData.tag.isSavingsTag}>{
								tagData.tag.isSavingsTag ? formatMoneyString(tagData.tag.getSavingsAtEndOfMonth(curMonth), true) : '-'
							}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="section incomeTags">
			<table class='tagTable'>
				<thead>
					<tr class='header'>
						<th scope='col' class='tableTitle'>Income</th>
						<th scope='col'>Average</th>
						<th scope='col'>Budgeted</th>
						<th scope='col'>Savings</th>
					</tr>
				</thead>
				<tbody>
					{#each incomeTagData as tagData}
						<tr>
							<td><Tag {...tagData.tag}></Tag></td>
							<td class='moneyString'>{formatMoneyString(-tagData.expenses, true)}</td>
							<td class='moneyString' class:placeholder={tagData.tag.getBudgetInMonth(curMonth) === 0}>{
								tagData.tag.getBudgetInMonth(curMonth) !== 0 ? formatMoneyString(tagData.tag.getBudgetInMonth(curMonth), true) : '-'
							}</td>
							<td class='moneyString' class:placeholder={!tagData.tag.isSavingsTag}>{
								tagData.tag.isSavingsTag ? formatMoneyString(tagData.tag.getSavingsAtEndOfMonth(curMonth), true) : '-'
							}</td>
						</tr>	
					{/each}
				</tbody>
			</table>
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
			background-color: var(--NegativeColor);
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
			min-width: 75px;
			
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
	

			.buttonHolder .buttonWrapper {
				position: relative;
				top: 50%;
				transform: translateY(-50%);
				text-align: right;
				transition: .3s opacity, .3s margin-right;
			}
			.buttonHolder.noAssignableTransactions .buttonWrapper {
				opacity: 0;
				margin-right: -20px;
				pointer-events: none;
			}


	.dataHolder {
		margin-top: 30px;
		margin-left: 20px;


		display: grid;
		grid-template: 
			'distribution distribution'
			'expensesTags incomeTags'
			'tags budget';
		grid-template-columns: 50% 50%;
	}

	.dataHolder .section.distribution {
		grid-area: distribution;
		display: flex;
		justify-content: space-between;
		border-bottom: 1px solid #eee;
	}
	





	
	.dataHolder .section.expensesTags {
		margin-top: 20px;
		grid-area: expensesTags;
	}
	.dataHolder .section.incomeTags {
		margin-top: 20px;
		grid-area: incomeTags;

	}


		.section.incomeTags {
			padding-left: 30px;
		}

		.section.expensesTags .tagTable,
		.section.incomeTags .tagTable {
			font-size: 13px;
			width: 100%;
		}	

		
		.section.expensesTags .tagTable {
			border-right: 1px solid #eee;
			padding-right: 30px;
		}
	

		.section .tagTable .tableTitle {
			text-transform: uppercase;
		}

		.section .tagTable .header th {
			text-align: left;
			font-size: 13px;
			padding-bottom: 5px;
		}
		
		.section .tagTable td {
			line-height: 22px;
		}
		.section .tagTable td.placeholder {
			color: #aaa;
		}

		.tagTable .moneyString.negative {
			color: var(--NegativeColor);
		}
		
</style>