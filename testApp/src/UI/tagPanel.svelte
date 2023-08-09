<script>
	import { formatMoneyString } from '../polyfill';
	import Color from '../color';
    import Tag from './tag.svelte';

	export let color = new Color('#000');
	export let name = 'No name...';
	export let isSavingsTag;
	export let totalSavings;
</script>

<div class='tagPanel' style={'border-bottom-color: ' + color.hex}>
	<Tag {color} {name}></Tag>
	{#if isSavingsTag}
		<div class='savingInfoHolder'>Savings: {formatMoneyString(totalSavings)}</div>
	{/if}
	<slot/>
</div>



<style>
	.tagPanel {
		position: relative;
		padding: 20px;
		background: #fefefe;

		border: 1px solid #eee;
		border-bottom: 3px solid red;
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