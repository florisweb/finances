<script>
	import BudgetContribRow from './budgetContribRow.svelte';
	import { createEventDispatcher } from 'svelte';
	import { formatMoneyString } from '../../polyfill';

	const dispatch = createEventDispatcher();
	import MoneyInput from "../moneyInput.svelte";
	import Tag from "../tag.svelte";
    import Checkbox from '../checkbox.svelte';
	export let tag;
	export let budget = 0;

	export let isSumRow = false;
	export let sum = 0;

	let isIncome = budget > 0;
	if (budget < 0) budget = -budget;
	let absBudget = budget;
	$: budget = absBudget * (isIncome ? 1 : -1);


	export let contributions = [
		{
			name: '50',
			budget: 5
		},
		{
			name: '51',
			budget: 15
		},
		{
			name: '52',
			budget: 10
		}
	];

	$: if (contributions.length)
	{
		let trueTotal = contributions.map(r => r.budget).reduce((a, b) => a + b, 0);
		isIncome = trueTotal > 0;
		absBudget = Math.abs(trueTotal);
	}

</script>



{#if (!isSumRow)}
	<tr class='budgetRow'>
		<td class='tag'><Tag {...tag}></Tag></td>
		<td><Checkbox bind:checked={isIncome} disabled={contributions.length}></Checkbox></td>
		<td class='moneyInputHolder'>
			<MoneyInput 
				on:input={(_event) => absBudget = _event.detail || 0} value={absBudget} 
				placeholder={isIncome ? 'Income...' : 'Expenses...'}
				disabled={contributions.length}
			></MoneyInput>
		</td>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<td><div class='removeButton' on:click={() => dispatch('delete')}>X</div></td>
	</tr>
	{#each contributions as contrib}
		<BudgetContribRow 
			bind:name={contrib.name} 
			bind:budget={contrib.budget} 
			isLast={contributions[contributions.length - 1] === contrib}
			on:delete={() => {
				contributions = contributions.filter((_contrib) => _contrib !== contrib);
			}}
		></BudgetContribRow>
	{/each}
{:else}
	<tr class='budgetRow isSumRow'>
		<td class='sumTitle'>Netto</td>
		<td></td>
		<td class='moneySum'>{formatMoneyString(sum)}</td>
		<td></td>
	</tr>
{/if}


<style>
	.budgetRow {
		position: relative;
		height: 35px;
		width: 100%;
		padding-top: 5px;
		padding-bottom: 5px;
	}
	.budgetRow:not(:first-child) {
		border-top: 1px solid #eee;
	}



	/* BUDGETROW */
	td {
		height: 25px;
	}
	.tag {
		margin-top: 2px;
	}
	.removeButton {
		width: 20px;
		height: 25px;
		line-height: 25px;
		margin-left: 10px;
	}

	.moneyInputHolder {
		margin-top: -1px;
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
		font-size: 12px;
		color: #444;
		font-weight: bold;
	}
</style>