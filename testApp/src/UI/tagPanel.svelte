<script>
	import { formatMoneyString } from '../polyfill';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
    import Tag from './tag.svelte';

	export let tag;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class='tagPanel' style={'border-bottom-color: ' + tag.color.hex} on:click={(_event) => dispatch('click', _event)}>
	<Tag color={tag.color} name={tag.name}></Tag>
	{#if tag.isSavingsTag}
		<div class='savingInfoHolder'>Savings: {formatMoneyString(tag.totalSavings)}</div>
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
</style>