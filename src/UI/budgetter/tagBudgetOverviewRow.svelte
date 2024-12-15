<script>
	import { formatMoneyString } from '../../polyfill';

	import Tag from "../tag.svelte";
	export let tag;
	export let budget = 0;
	export let averageExpenses = 0;
	export let averageExpensesDuringBudget = 0;

	export let isSumRow = false;
	export let sum = 0;
</script>



{#if (!isSumRow)}
	<tr class='row'>
		<td class='budgetFulfilled'>
			{budget < -averageExpenses ? '✓' : ''}
		</td>
		<td class='tag'><Tag {...tag}></Tag></td>
		<td class='moneyHolder budget' class:isNegative={budget < 0} class:isNull={budget === 0}>{formatMoneyString(budget)}</td>
		<td class='moneyHolder budget' class:isNegative={averageExpenses > 0} class:isNull={averageExpenses === 0}>{formatMoneyString(-averageExpenses)}</td>
		<td class='moneyHolder budget' class:isNegative={averageExpensesDuringBudget > 0} class:isNull={averageExpensesDuringBudget === 0}>{formatMoneyString(-averageExpensesDuringBudget)}</td>
	</tr>
{:else}
	<tr class='row'>
		<td class='budgetFulfilled'>
			{sum < -averageExpenses ? '✓' : ''}
		</td>
		<td class='sumTitle moneyHolder'>Netto</td>
		<td class='moneySum moneyHolder budget' class:isNegative={sum < 0} class:isNull={sum === 0}>{formatMoneyString(sum)}</td>
		<td class='moneySum moneyHolder budget' class:isNegative={averageExpenses > 0} class:isNull={averageExpenses === 0}>{formatMoneyString(-averageExpenses)}</td>
		<td class='moneySum moneyHolder budget' class:isNegative={averageExpensesDuringBudget > 0} class:isNull={averageExpensesDuringBudget === 0}>{formatMoneyString(-averageExpensesDuringBudget)}</td>
	</tr>
{/if}


<style>
	.row {
		position: relative;
		height: 35px;
		width: 100%;
		padding-top: 5px;
		padding-bottom: 5px;
	}
	.row:not(:last-child) td:not(.budgetFulfilled) {
		border-bottom: 1px solid #eee;
	}



	/* BUDGETROW */
	td {
		height: 25px;
	}
	td.budgetFulfilled {
		display: inline;
		line-height: 35px;
		color: #999;
	}
	td.tag {
		margin-top: 2px;
	}
	td.moneyHolder {
		font-size: 12px;
		color: #444;
	}

	
	/* SUMROW */
	.sumTitle {
		padding-left: 25px;
	}
	.moneySum {
		text-align: center;
		padding-right: 10px;
	}
	.sumTitle, .moneySum {
		font-weight: bold;
	}

	.budget {
		padding-left: 15px;
	}
	.budget.isNegative {
		padding-left: 8px;
		color: #844;
	}
	.budget:not(.isNegative) {
		color: #484;
	}
	.budget.isNull {
		color: #ccc;
	}
</style>