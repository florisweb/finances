<div id='mainContent'>
	<slot />
</div>

<style>
		
	#mainContent {
		position: absolute;
		left: var(--sideBarWidth);
		top: 0;
		width: calc(100vw - var(--sideBarWidth));
		height: 100vh;
		overflow: auto;
	}
</style>