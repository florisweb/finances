<script>
	import { createEventDispatcher } from 'svelte';
    import ColoredMoneyString from './coloredMoneyString.svelte';
	const dispatch = createEventDispatcher();
	export let budget;

	let averageExpenses = 0;
	$: averageExpenses = budget.averageExpenses;

	let finishedPositive = false;
	$: finishedPositive = budget.hasFinished && budget.sum < averageExpenses - 10;
	let finishedNegative = false;
	$: finishedNegative = budget.hasFinished && budget.sum > averageExpenses + 10;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div 
	class='panel' 
	class:active={budget.isActive} 
	class:finishedPositive={finishedPositive} 
	class:finishedNegative={finishedNegative} 
	class:finished={budget.hasFinished}
	on:click={(_event) => dispatch('click', _event)}
	>
	<div class='title'>{budget.shortName}</div>
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
	.panel.finished {
		padding-left: 60px;
	}
	.panel.finished::after {
		position: absolute;
		left: 15px;
		top: 23px;
		width: 30px;
		height: 30px;
		
		content: '-';
		line-height: 29px;
		font-size: 20px;
		font-weight: bold;
		color: #bbb;
		text-align: center;


		background-color: #fafafa;
		border: 2px solid #ccc;
		border-radius: 100%;
	}
	.panel.finishedPositive::after {
		content: '✓';
		background-color: #efe;
		border: 2px solid #7a7;
		font-weight: normal;
		line-height: 30px;
		font-size: 15px;
		color: #7a7;
	}
	.panel.finishedNegative::after {
		content: 'x';
		background-color: #fee;
		border: 2px solid #f77;
		font-weight: normal;
		line-height: 29px;
		font-size: 17px;
		color: #f77;
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