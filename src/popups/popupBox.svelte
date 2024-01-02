<script>
	export let isOpen;
	export let customClass;
</script>

<div class={'popup ' + (!isOpen ? 'hide ' : '') + (customClass ? customClass : '')}>
	<slot name='header'/>
	<slot/>
</div>
<style>
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

	.popup.hide {
		transform: scale(.8) translate(-62.5%, -62.5%);
	}
</style>