<script>
	import { openPageIndexStore } from '../App.js';
	import { onMount } from 'svelte';
	import Header from './header.svelte';
	export let title = false;
	export let isOpen = false;

	let self;
	let ownIndex = -1;
	let curOpenPageIndex = 0;

	$: isOpen = curOpenPageIndex === ownIndex;
	openPageIndexStore.subscribe((_index) => curOpenPageIndex = _index);
	onMount(() => {
		for (let i = 0; i < self.parentNode.children.length; i++)
		{
			if (self.parentNode.children[i] === self) return ownIndex = i;
		}
	});
</script>

<div class={'page' + (!isOpen ? ' hide' : '')} bind:this={self}>
	{#if (title !== false)}
		<div class="pageHeader">
			<Header title={title}></Header>
		</div>
	{/if}
	<slot />
</div>

<style>
	.page {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		min-height: 100vh;
		height: auto;

		padding: 30px;
		padding-top: 0;

		transition: opacity .3s, margin-top .3s;
	}

	.page.hide { 
		opacity: 0;
		pointer-events: none;
		margin-top: 30px;
	}

	.pageHeader {
		position: relative;
		width: 100%;
		padding: 20px;
		padding-bottom: 10px;
	}
</style>