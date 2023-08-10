<script>
	import { fade } from 'svelte/transition';
	import { formatMoneyString } from '../polyfill';
	import TagPanel from './tagPanel.svelte';

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher()

	export let name;
	export let color;
	export let isSavingsTag;
	export let totalSavings;
	export let income = 15;
	export let expenses = 50;
	export let budget = 20;
</script>


<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class='tagOverviewPanel' on:click={() => dispatch('click')}>
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
</style>