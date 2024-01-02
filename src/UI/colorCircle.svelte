<script>
	import Color from '../color';
	export let color = new Color('#000');
</script>

<div class='colorCircle' style={
	'background: ' + color.copy().merge(new Color('rgba(255, 255, 255, 0)'), .4).RGBA + '; ' + 
	'border-color: ' + color.hex
}></div>

<style>
	.colorCircle {
		position: relative;
		width: 16px;
		height: 16px;
		border-radius: 100%;
		margin: 2px;
		margin-left: 0;
		border: 1px solid #888;
	}
</style>