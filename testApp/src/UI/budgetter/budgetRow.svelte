<script>
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
</script>



{#if (!isSumRow)}
	<tr class='budgetRow'>
		<td class='tag'><Tag {...tag}></Tag></td>
		<td><Checkbox bind:checked={isIncome}></Checkbox></td>
		<td class='moneyInputHolder'><MoneyInput bind:value={absBudget} placeholder={isIncome ? 'Income...' : 'Expenses...'}></MoneyInput></td>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<td><div class='removeButton' on:click={() => dispatch('delete')}>X</div></td>
	</tr>
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
	.budgetRow:not(:last-child) {
		border-bottom: 1px solid #ddd;
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