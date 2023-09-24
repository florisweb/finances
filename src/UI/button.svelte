<script>
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	
	export let name;
	export let filled = true;
	export let style = '';
	export let customClass = '';

	let button;
	onMount(() => {
		button.style = style;
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class={'button ' + (filled ? ' filled ' : '') + (customClass ? customClass : '')} bind:this={button} on:click={(_event) => dispatch('click', _event)}>
	{name}
</div>