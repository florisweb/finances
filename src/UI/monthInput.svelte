<script>
	import { MonthIdentifier } from '../types';
	import Date from '../time';
    import DropDown from './dropDown.svelte';
	
	export let value;
	export let placeholder = 'Month...';
	export let allowNoDate = true;

	// For displayal only
	let curMonth = new Date().getMonth();
	let curYear = new Date().getFullYear();
	$: {
		if (!value) {curMonth = 'NO-DATE'; break $};
		curMonth = value.date.getMonth() ?? new Date().getMonth();
		curYear = value.date.getFullYear() ?? new Date().getFullYear();
	}


	// Actual values
	let lastMonthVal = curMonth;
	let lastYearVal = curYear;
	
	function onInput(_newVal) {
		let regex = /[^0-9]/g;
		lastYearVal = String(_newVal).replace(regex, '').substr(0, 4);
	}


	// Which options the dropdown contains
	let monthOptions = new Date().getMonths().map((month, i) => {return {
		value: i,
		contentHTML: month.name
	}})
	if (allowNoDate) monthOptions = [...monthOptions, {value: 'NO-DATE', contentHTML: '-- No date --'}];
</script>

<div class='monthInput'>
	<DropDown options={monthOptions} value={curMonth} on:change={(_event) => {
		lastMonthVal = _event.detail;
		if (_event.detail === 'NO-DATE') return value = false;
		value = new MonthIdentifier().setFromId((_event.detail + 1) + '/' + lastYearVal);
	}}></DropDown>
	{#if (value)}
		<input 
			on:input={
				(_event) => {
					onInput(_event.target.value);
					if (lastMonthVal === 'NO-DATE') return value = false;
					value = new MonthIdentifier().setFromId((lastMonthVal + 1) + '/' + lastYearVal);
				}
			}
			value={curYear}
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