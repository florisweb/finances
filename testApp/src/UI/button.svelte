<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	
	export let name;
	export let filled = true;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class={'button' + (filled ? ' filled' : '')} on:click={(_event) => dispatch('click', _event)}>
	{name}
</div>