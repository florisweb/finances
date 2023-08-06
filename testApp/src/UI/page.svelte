<script>
	import PageHeader from './pageHeader.svelte';
	export let title;
	export let isOpen = false;
</script>

<div class={'page' + (!isOpen ? ' hide' : '')}>
	<PageHeader title={title}></PageHeader>
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
</style>