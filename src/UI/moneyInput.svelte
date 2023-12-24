<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	
	export let value;
	export let placeholder = '€0';
	export let canBeNegative = false;
	export let element;
	let moneyValue = value;

	function onInput(_value) {
		let regex = /[^0-9.,]/g;
		if (canBeNegative) regex = /[^0-9.,-]/g;
		let string = String(_value).replace(regex, '').replace(',', '.');
		let parts = string.split('.').splice(0, 2);
		
		if (parts.length === 1)
		{
			element.value = parseInt(parts[0]) || parts[0];
		} else element.value = parts[0] + '.' + parts[1].substr(0, 2);
		moneyValue = parseFloat(element.value) || 0;
	}
</script>

<input 
	on:input={(_event) => {onInput( _event.target.value); dispatch('input', moneyValue)}}
	on:change={(_event) => {onInput( _event.target.value); dispatch('change', moneyValue)}}
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