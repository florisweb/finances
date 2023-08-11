<script>
	import { formatMoneyString } from '../../polyfill';

	import Tag from "../tag.svelte";
	export let tag;
	export let budget = 0;

	export let isSumRow = false;
	export let sum = 0;
</script>



{#if (!isSumRow)}
	<tr class='row'>
		<td class='tag'><Tag {...tag}></Tag></td>
		<td class='moneyHolder'>{formatMoneyString(budget)}</td>
		<td class='moneyHolder'>{formatMoneyString(budget)}</td>
	</tr>
{:else}
	<tr class='row'>
		<td class='sumTitle moneyHolder'>Netto</td>
		<td class='moneySum moneyHolder'>{formatMoneyString(sum)}</td>
		<td class='moneySum moneyHolder'>{formatMoneyString(sum)}</td>
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
	.row:not(:last-child) {
		border-bottom: 1px solid #ddd;
	}



	/* BUDGETROW */
	td {
		height: 25px;
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
</style>