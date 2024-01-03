<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	import BudgetManager from '../data/budgetManager';
	let copyableBudget = false;

	BudgetManager.dataStore.subscribe((_budget) => {
		copyableBudget = BudgetManager.activeBudget;
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class='panel' on:click={(_event) => dispatch('click', _event)}>
	<div class='title'>Add Budget</div>
	{#if copyableBudget}
		<div class='copyActiveButton' on:click={(_event) => dispatch('clickButton', _event)} title='Copy the active budget'>
			<img src='images/copyIcon.png'>
		</div>
	{/if}
</div>



<style>
	.panel {
		position: relative;
		padding: 20px;
		padding-left: 60px;
		padding-bottom: 10px;
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
	.panel::after {
		position: absolute;
		left: 15px;
		top: 23px;
		width: 30px;
		height: 30px;
		
		content: '+';
		line-height: 29px;
		font-size: 20px;
		font-weight: bold;
		color: #bbb;
		text-align: center;

		background-color: #fafafa;
		border: 2px solid #ccc;
		border-radius: 100%;
	}



	.panel .title {
		position: relative;
		color: #444;
		height: 50px;
		line-height: 40px;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.panel .copyActiveButton {
		position: absolute;
		right: 0;
		top: 0;
		height: 100%;
		aspect-ratio: 1;
		width: auto;

		/* background-color: rgba(0, 0, 0, .05); */
		background-color: #daf;
		
		text-align: center;
		line-height: 100%;
		vertical-align: middle;
		font-size: 30px;

	}

	.panel .copyActiveButton img {
		height: 100%;
		width: auto;
		padding: 20px;
		transition: .3s opacity;
	}
	.panel .copyActiveButton:hover img {
		opacity: .5;
	}
</style>