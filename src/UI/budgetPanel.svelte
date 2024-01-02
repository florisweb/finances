<script>
	import { createEventDispatcher } from 'svelte';
    import ColoredMoneyString from './coloredMoneyString.svelte';
	const dispatch = createEventDispatcher();
	export let budget;

	let averageExpenses = 0;
	$: averageExpenses = budget.averageExpenses;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class='panel' class:active={budget.isActive} on:click={(_event) => dispatch('click', _event)}>
	<div class='title'>{budget.name}</div>
	<div class='moneyInfoHolder'>
		Netto: <ColoredMoneyString money={budget.sum}></ColoredMoneyString> 
		{#if typeof averageExpenses !== 'symbol'}
			- Reality: <ColoredMoneyString money={averageExpenses}></ColoredMoneyString>
		{/if}
	</div>
</div>



<style>
	.panel {
		position: relative;
		padding: 20px;
		background: #fefefe;

		border: 1px solid #eee;
		border-bottom: 3px solid #ddd;
		box-shadow: 5px 5px 20px 10px rgba(0, 0, 0, .03);

		cursor: pointer;
		opacity: 0;
		margin-top: 20px;
		animation: panelFadeIn .45s;
		animation-fill-mode: forwards;
	}
	.panel.active {
		border-bottom: 3px solid #daf;
	}

	.panel .title {
		position: relative;
		color: #444;
		height: 20px;
		line-height: 20px;
		text-transform: uppercase;
		white-space: nowrap;
	}
	.panel.active .title {
		font-style: italic;
	}


	.moneyInfoHolder {
		margin-top: 5px;
		color: #444;
		font-size: 12px;
	}
</style>