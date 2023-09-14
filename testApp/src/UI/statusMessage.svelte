<script>	
	let isOpen = false;
	let message = '';

	export function open(_text) {
		isOpen = true;
		message = _text;
		setTimeout(() => isOpen = false, 300 * _text.length);
	}
</script>

<div class='message' class:hide={!isOpen}>
	{message}
</div>

<style>
	.message {
		position: fixed;
		float: bottom;
		left: 0;
		bottom: 0;
		margin: 20px;
		width: auto;
		height: auto;

		background: #daf;
		color: #fff;
		padding: 20px 15px;

		box-shadow: 5px 5px 20px rgba(0, 0, 0, .1);
		transition: transform .3s, bottom .3s, opacity .3s;
	}


	.message.hide {
		transform: scale(.8);
		bottom: -30px;
		opacity: 0;
		pointer-events: none;
	}
</style>