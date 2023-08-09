<script>
	import { formatMoneyString } from '../polyfill';
	import TagPanel from './tagPanel.svelte';

	export let name;
	export let color;
	export let isSavingsTag;
	export let totalSavings;
	export let income = 15;
	export let expenses = 50;
	export let budget = 20;


	let showTransactions = false;
</script>


<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class={'tagOverviewPanel' + (showTransactions ? ' showTransactions' : '')} on:click={() => showTransactions = !showTransactions}>
	<TagPanel tag={{name: name, color: color, isSavingsTag: isSavingsTag, totalSavings: totalSavings}}></TagPanel>
	<div class='infoHolder'>
		{#if (income !== 0)}
			<p>{formatMoneyString(income)} in</p>
		{/if}
		{#if (expenses !== 0)}
			<p>{formatMoneyString(expenses)} out</p>
		{/if}
		{#if (income !== 0 || expenses !== 0)}
			<div class='subtractLine'></div>
		{/if}
		<p style={'margin-left: ' + (income - expenses < 0 ? '-3px' : '')}>{formatMoneyString(income - expenses)} netto ({formatMoneyString(budget)} budget)</p>
	</div>
	<div class='transactionTableHolder'>
		<slot name='transactionTable' />
	</div>
</div>

<style>

	.tagOverviewPanel {
		position: relative;
		background: #fff;
		box-shadow: 5px 5px 20px 10px rgba(0, 0, 0, .03);

		cursor: pointer;
	}
	.infoHolder {
		z-index: 10;
		background-color: #fff;
		position: relative;
		padding: 20px;
		height: auto;

		border: 1px solid #eee;
		border-top: none;
	}

		.subtractLine {
			position: relative;
			width: 70%;
			height: 1px;
			margin: 5px 0;
			background-color: #ccc;
		}



		p {
			position: relative;
			height: 20px;
			line-height: 20px;
			font-size: 13px;
			color: #444;
			margin: 0;
			margin-left: 5px;
		}


	.tagOverviewPanel.showTransactions {
		transition: .3s all;
		
	}
	.tagOverviewPanel.showTransactions {
		position: fixed;
		top: 50vh;
		left: 50vw;
		z-index: 100;

		transform: translate(-50%, -50%);
		width: 80vw;
		height: 80vh;
		box-shadow: 10px 10px 50px 30px rgba(0, 0, 0, .1);
	}
	.tagOverviewPanel:not(.showTransactions) .transactionTableHolder {
		display: none;
	}
	.tagOverviewPanel .transactionTableHolder {
		position: relative;
		width: 100%;
		height: calc(80vh - 200px);
		overflow: auto;
		padding: 20px;
	}
	
</style>