<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	import MoneyInput from "../moneyInput.svelte";
	import Tag from "../tag.svelte";
	export let tag;
	export let budget = 0;
</script>



<tr class='budgetRow'>
	<td class='tag'><Tag {...tag}></Tag></td>
	<td><MoneyInput value={budget} placeholder='Expenses...'></MoneyInput></td>
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

		display: flex;
	}
	.budgetRow:not(:last-child) {
		border-bottom: 1px solid #ddd;
	}

	td {
		height: 25px;
	}
	.tag {
		margin-top: 2px;
		flex: 1;
	}
	.removeButton {
		width: 20px;
		height: 25px;
		line-height: 25px;
		margin-left: 10px;
	}
</style>