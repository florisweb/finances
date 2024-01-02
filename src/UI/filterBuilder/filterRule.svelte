<script>
    import { slide } from 'svelte/transition';

	import Button from '../button.svelte';
	import DropDown from '../dropDown.svelte';
	import Input from '../input.svelte';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let rule = ['description', 'includes', null];

	const targetOptions = [
		{value: 'description',			contentHTML: 'Description'},
		{value: 'targetName', 			contentHTML: 'Target Name'},
		{value: 'bankClassification', 	contentHTML: 'Bank Classification'}
	];

	const operatorOptions = [
		{value: '===', 		contentHTML: 'Equals'},
		{value: 'includes', contentHTML: 'Includes'},
		{value: '>', 		contentHTML: 'Is bigger than'},
		{value: '<', 		contentHTML: 'Is smaller than'}
	];
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class='filterRule' on:click|self={() => dispatch('addRule')} transition:slide>
	<DropDown options={targetOptions} bind:value={rule[0]} customClass='clickableWhenPopupOpen'></DropDown>
	<DropDown options={operatorOptions} bind:value={rule[1]} customClass='clickableWhenPopupOpen'></DropDown>
	<Input bind:value={rule[2]} placeholder='filter...' customClass='clickableWhenPopupOpen'></Input>
	<Button name='X' customClass='clickableWhenPopupOpen' style='height: 35px' on:click={() => dispatch('delete')}></Button>
</div>

<style>
	.filterRule {
		display: flex;
		margin-left: 5px;
		pointer-events: none;
		transition: margin-top .3s, opacity .3s;
	}
	.filterRule:not(:first-child) {
		margin-top: 15px;
	}

		.filterRule:not(:first-child)::before {
			position: relative;
			margin-left: 0px;
			margin-top: -14px;
			margin-right: -22px;

			content: 'AND';
			font-size: 10px;
			color: #777;
		}


		.filterRule:last-child::after {
			position: relative;
			margin-top: 35px;
			right: calc(100% - 74.5px);
			margin-left: -75px;

			height: 20px;
			padding: 0 10px;

			border: 1px solid #eee;


			content: '+ Add rule';
			white-space: nowrap;
			line-height: 20px;
			text-align: center;
			font-size: 10px;
			color: #777;
			pointer-events: all;
		}


		
</style>