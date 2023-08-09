<script>
	import Color from '../color';
	export let color = new Color('#000');
	export let name = 'No name...';
</script>


<div class='tagHolder'>
	<div class='indicator' style={
		'background: ' + color.copy().merge(new Color('rgba(255, 255, 255, 0)'), .4).RGBA + '; ' + 
		'border-color: ' + color.hex
	}></div>
	<div class='nameHolder'>{name}</div>
</div>




<style>
	.tagHolder {
		display: flex;
		height: 20px;
		width: auto;
	}
		
		.indicator {
			position: relative;
			width: 16px;
			height: 16px;
			border-radius: 100%;
			margin: 2px;
			margin-left: 0;
			border: 1px solid #888;
		}

		.nameHolder {
			position: relative;
			height: 20px;
			line-height: 20px;
			font-size: 13px;
			color: #444;
			margin-left: 5px;
		}
</style>