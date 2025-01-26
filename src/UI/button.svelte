<script>
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	
	export let name;
	export let icon;
	export let filled = true;
	export let disabled = false;
	export let style = '';
	export let customClass = '';

	let button;
	onMount(() => {
		button.style = style;
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div 	
	class={'button noselect ' + (customClass ? customClass : '')} 
	class:filled={filled} 
	class:disabled={disabled} 
	bind:this={button} 
	on:click={(_event) => {if (!disabled) dispatch('click', _event)}}
>
	{#if typeof icon !== 'undefined'}
		<!-- svelte-ignore a11y-missing-attribute -->
		<img src={icon}>
	{/if}
	{name}
</div>

<style>
	.button {
		position: relative;
		display: inline-block;
		width: auto;
		font-size: 14px;
		padding: 10px 15px;
	
		color: #444;
		text-transform: uppercase;
	
		cursor: pointer;
		transition: box-shadow .2s, opacity .2s, filter .2s;
	}

	.button.filled {
		background: #daf;
		color: #fff;
	}
	.button.disabled {
		filter: grayscale(.5);
		opacity: .5;
	}
	.button:hover {
		box-shadow: 10px 10px 30px 10px rgba(0, 0, 0, .02);
	}
	.button img {
		position: relative;
		height: 20px;
		width: auto;
		margin: -5px;
		margin-right: 5px;
	}
</style>