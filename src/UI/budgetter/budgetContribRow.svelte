<script>
	import { createEventDispatcher } from 'svelte';
	import { formatMoneyString } from '../../polyfill';

	const dispatch = createEventDispatcher();
	import MoneyInput from "../moneyInput.svelte";
    import Checkbox from '../checkbox.svelte';
	export let budget = 0;
	export let name = null;
	export let isLast = false;


	let isIncome = budget > 0;
	if (budget < 0) budget = -budget;
	let absBudget = budget;
	$: budget = absBudget * (isIncome ? 1 : -1);
</script>



<tr class='budgetRow' class:isLast={isLast}>
	<td class='lineHolder'>
		<div class="line"></div>
		<input class='nameInputField' placeholder="Contribution name..." bind:value={name}>
	</td>
	<td><Checkbox bind:checked={isIncome}></Checkbox></td>
	<td class='moneyInputHolder'><MoneyInput on:input={(_event) => absBudget = _event.detail || 0} value={absBudget} placeholder={isIncome ? 'Income...' : 'Expenses...'}></MoneyInput></td>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<td><div class='removeButton' on:click={() => dispatch('delete')}>X</div></td>
</tr>


<style>
	.budgetRow {
		position: relative;
		height: 35px;
		width: 100%;
		padding-top: 5px;
		padding-bottom: 5px;
	}
	.budgetRow.isLast {
		border-bottom: 1px solid #eee;
	}



	/* BUDGETROW */
	td {
		height: 25px;
	}
	.line {
		position: relative;
		float: left;
		margin-left: 8px;
		width: 1px;
		height: calc(100% + 2px);
		background-color: #ccc;
	}
	.line::after {
		position: absolute;
		top: calc(50% - 2px);
		content: '';
		height: 1px;
		width: 10px;
		background-color: #ccc;
	}
	.budgetRow.isLast .line {
		margin-top: -2px;
		height: calc(50% + 1px);
	}
	.budgetRow.isLast .line::after {
		top: 100%;
	}

	.nameInputField {
		float: left;
		height: 30px;
		width: calc(100% - 15px - 10px);
		margin-left: 15px;
		border: 1px solid red;
		border: none;
		box-shadow: none;
		font-size: 13px;
		color: #444;
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