<script>
	import PopupBox from './popupBox.svelte';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	export let isOpen = false;
	export let customClass;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class={'popupHolder ' + (!isOpen ? 'hide ' : '') + (customClass || '')} on:click|self={() => dispatch('passiveClose')}>
	<PopupBox bind:isOpen={isOpen} customClass='defaultPopup'>
		<slot name='header' slot='header'/>
		<slot/>
	</PopupBox>
	<slot name='extraPopupBoxes'/>
</div>
<style>
	.popupHolder {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 1000;
		width: 100vw;
		height: 100vh;

		background: rgba(0, 0, 0, .5);
		transition: opacity .3s;
	}

	.popupHolder.hide {
		opacity: 0;
		pointer-events: none;
	}
</style>