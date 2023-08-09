<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	export let isOpen = false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class={'popupHolder' + (!isOpen ? ' hide' : '')} on:click|self={() => dispatch('passiveClose')}>
	<div class='popup'>
		<slot name='header'/>
		<slot/>
	</div>
</div>
<style>
	.popupHolder {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;

		background: rgba(0, 0, 0, .5);
		transition: opacity .3s;
	}

	.popupHolder.hide {
		opacity: 0;
		pointer-events: none;
	}


	.popup {
		position: relative;

		left: 50vw;
		top: 45vh;
		transform: translate(-50%, -50%);

		max-width: 600px;
		width: 90vw;
		height: auto;
		padding: 20px 30px;

		background: #fff;
		box-shadow: 10px 10px 20px rgba(0, 0, 0, .1);
		transition: transform .3s;
	}

	.popupHolder.hide .popup {
		transform: scale(.8) translate(-62.5%, -62.5%);
	}
</style>