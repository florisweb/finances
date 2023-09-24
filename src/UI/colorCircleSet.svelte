<script>
	import ColorCircle from './colorCircle.svelte';
	export let color;
	export let name = 'No name...';
</script>


<div class='tagHolder'>
	<ColorCircle color={color}></ColorCircle>
	<div class='nameHolder'>{name}</div>
</div>

<style>
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
</style>