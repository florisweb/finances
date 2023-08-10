<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	
	export let value;
	export let placeholder = 'No name...';
	export let element;
</script>

<input 
	on:input={(_event) => {value = _event.target.value; dispatch('input', value)}}
	on:change={(_event) => {value = _event.target.value; dispatch('change', value)}}
	value={value}
 	placeholder={placeholder}
	bind:this={element}
 >

<style>
	input {
		position: relative;
		
		width: 100%;
		height: 35px;
		padding: 7.5px;

		font-size: 14px;
		background: #fff;
		box-shadow: 10px 10px 30px 10px rgba(0, 0, 0, .02);
		border: 1px solid #eee;
	}
</style>