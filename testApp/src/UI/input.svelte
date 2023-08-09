<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	
	export let value;
	export let placeholder = 'No name...';
</script>

<input 
	on:input={(_event) => {value = _event.target.value; dispatch('input', value)}}
	on:change={(_event) => {value = _event.target.value; dispatch('change', value)}}
	value={value}
 	placeholder={placeholder}
 >

<style>
	input {
		position: relative;
		
		width: auto;
		height: 35px;
		padding: 7.5px;

		font-size: 14px;
		background: #fff;
		box-shadow: 10px 10px 30px 10px rgba(0, 0, 0, .02);
		border: 1px solid #eee;

		margin-top: 0;
		opacity: 1;
		transition: opacity .2s, margin-top .2s;
	}
</style>