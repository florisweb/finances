<script>
	import { getContext } from "svelte";
	let App = getContext('App');
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class='tagPanel' on:click={() => App.createTagPopup.open()}>
	<div class='tagHolder'>
		<div class='indicator'>+</div>
		<div class='nameHolder'>Add Tag</div>
	</div>
</div>

<style>
	.tagPanel {
		position: relative;
		padding: 20px;
		background: #fefefe;

		border: 1px solid #eee;
		border-bottom: 3px solid #999;
		box-shadow: 5px 5px 20px 10px rgba(0, 0, 0, .03);

		cursor: pointer;
		opacity: 0;
		margin-top: 20px;
		animation: panelFadeIn .45s;
		animation-fill-mode: forwards;
	}

	.tagHolder {
		display: flex;
		height: 20px;
		width: auto;
	}
		.nameHolder {
			position: relative;
			height: 20px;
			line-height: 20px;
			font-size: 13px;
			color: #444;
			margin-left: 5px;
			white-space: nowrap;
		}

		.indicator {
			position: relative;
			width: 20px;
			height: 20px;
			line-height: 20px;
			font-size: 25px;
			color: #777;
		}
</style>