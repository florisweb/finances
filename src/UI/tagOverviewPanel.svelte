<script>
	import { formatMoneyString } from '../polyfill';
	import TagPanel from './tagPanel.svelte';

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher()

	export let name;
	export let color;
	export let isSavingsTag;
	export let totalSavings;
	export let income = 0;
	export let expenses = 0;
	export let budget = false;
</script>


<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class='tagOverviewPanel' on:click={() => dispatch('click')}>
	<TagPanel tag={{name: name, color: color, isSavingsTag: isSavingsTag, totalSavings: totalSavings}}></TagPanel>
	<div class='infoHolder'>
		{#if (income - expenses !== 0)}
			<p>
				{formatMoneyString(Math.abs(income - expenses))} 
				{income > expenses ? 'in' : 'out'}
			</p>
		{/if}
		{#if (budget !== 0)}
			<p>
				{formatMoneyString(Math.abs(budget))} 
				{budget > 0 ? 'budget as income' : 'budget'}
			</p>
		{/if}
		{#if (income !== 0 || expenses !== 0)}
			<div class='subtractLine'></div>
		{/if}
		<p class:isTooNegative={income - expenses - budget < -10} class:isTooPositive={income - expenses - budget > 10} style={'margin-left: ' + (income - expenses - budget < 0 ? '-3px;' : '')}>{
			formatMoneyString(income - expenses - budget)} netto 
		</p>
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
		p.isTooNegative {
			color: #844;
		}
		p.isTooPositive {
			color: #484;
		}
</style>