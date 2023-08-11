<script>
	import { createEventDispatcher } from 'svelte';
	import { MonthIdentifier } from '../types';
	import Date from '../time';
    import DropDown from './dropDown.svelte';
	const dispatch = createEventDispatcher();
	
	export let value;
	export let placeholder = 'Month...';
	export let allowNoDate = true;

	let curMonth = new Date().getMonth();
	let curYear = new Date().getFullYear();

	$: {
		if (curMonth === 'NO-DATE') value = false;
		value = new MonthIdentifier().setFromId((curMonth + 1) + '/' + curYear);
	}


	function onInput() {
		let regex = /[^0-9]/g;
		value = String(value).replace(regex, '').substr(0, 4);
	}

	let monthOptions = new Date().getMonths().map((month, i) => {return {
		value: i,
		contentHTML: month.name
	}})
	if (allowNoDate) monthOptions = [...monthOptions, {value: 'NO-DATE', contentHTML: '-- No date --'}];
</script>

<div class='monthInput'>
	<DropDown options={monthOptions} bind:value={curMonth}></DropDown>
	{#if (curMonth !== 'NO-DATE')}
		<input 
			on:input={(_event) => {value = _event.target.value; onInput(); dispatch('input', value)}}
			on:change={(_event) => {value = _event.target.value; dispatch('change', value)}}
			bind:value={curYear}
			placeholder={placeholder}
		>
	{/if}
</div>

<style>
	.monthInput {
		display: flex;
	}
	input {
		position: relative;
		width: 80px;
		height: 35px;
		padding: 7.5px 5px;

		font-size: 12px;
		background: #fff;
		box-shadow: 10px 10px 30px 10px rgba(0, 0, 0, .02);
		border: 1px solid #eee;
		border-left: none;

		text-align: center;
	}
</style>