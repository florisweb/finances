<script>
	import { createEventDispatcher } from 'svelte';
    import Button from './button.svelte';
	const dispatch = createEventDispatcher();
	
	export let value;
	export let element;
	export let isInvisibleInput;
	export let customClass;
</script>

<div>	
	<input 
		on:input={(_event) => {value = _event.target.value; dispatch('input', value)}}
		on:change={(_event) => {value = _event.target.value; dispatch('change', value)}}
		value={value}
		placeholder={'Search...'}
		bind:this={element}
		class:isInvisibleInput={isInvisibleInput}
		class={customClass ?? ''}
	>
	<Button icon='images/RevolutLogo.png'></Button>
 </div>

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
	input.isInvisibleInput {
		border: none;
		box-shadow: none;
		padding: 0 2.5px;
		height: 25px;
	}

	input.header {
		color: #444;
		text-transform: uppercase;
		font-style: italic;
	}
</style>