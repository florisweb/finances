<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	
	export let value;
	export let placeholder = '€0';
	export let canBeNegative = false;
	export let element;

	function onInput() {
		let regex = /[^0-9.,]/g;
		if (canBeNegative) regex = /[^0-9.,-]/g;
		let parts = String(value).replace(regex, '').replace(',', '.').split('.').splice(0, 2);
		let string = parts[0];
		if (parts.length === 1) return value = string;
		value = string + '.' + parts[1].substr(0, 2);
	}
</script>

<input 
	on:input={(_event) => {value = _event.target.value; onInput(); dispatch('input', value)}}
	on:change={(_event) => {value = _event.target.value; dispatch('change', value)}}
	value={value}
 	placeholder={placeholder}
	bind:this={element}
 >
<style>
	input {
		position: relative;
		width: 80px;
		height: 25px;
		padding: 7.5px 5px;

		font-size: 12px;
		background: #fff;
		box-shadow: 10px 10px 30px 10px rgba(0, 0, 0, .02);
		border: 1px solid #eee;

		text-align: center;
	}
</style>