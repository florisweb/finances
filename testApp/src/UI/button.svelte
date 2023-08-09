<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	
	export let name;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class='button' on:click={(_event) => dispatch('click', _event)}>
	{name}
</div>

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