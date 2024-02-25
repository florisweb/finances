<script>
	import { formatMoneyString } from '../polyfill';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
    import Tag from './tag.svelte';

	export let tag;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class='tagPanel' class:savingsTag={tag.isSavingsTag} style={'border-bottom-color: ' + tag.color.hex} on:click={(_event) => dispatch('click', _event)}>
	<Tag color={tag.color} name={tag.name}></Tag>
	{#if tag.isSavingsTag}
		<div class='savingInfoHolder'>Savings: {formatMoneyString(tag.totalSavings)}</div>
	{/if}
	<slot/>
</div>



<style>
	.tagPanel {
		position: relative;
		height: calc(20px + 15px + 18px * 2);
		padding: 18px 20px;
		margin-top: 20px;
		
		background: #fefefe;
		border: 1px solid #eee;
		border-bottom: 3px solid red;
		box-shadow: 5px 5px 20px 10px rgba(0, 0, 0, .03);

		cursor: pointer;
		opacity: 0;
		animation: panelFadeIn .45s;
		animation-fill-mode: forwards;
	}
	.tagPanel:not(.savingsTag) {
		padding-top: 25px;
	}

	.savingInfoHolder {
		height: 15px;
		color: #444;
		font-size: 11px;
		margin-left: 23px;
		/* margin-top: 2px; */
	}
</style>