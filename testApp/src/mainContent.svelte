<script>
	import Page from "./UI/page.svelte";
	import UploadCsvPage from "./pages/uploadCSVPage.svelte";
	import TagManagementPage from "./pages/tagManagementPage.svelte";
</script>

<div id='mainContent'>
	<UploadCsvPage></UploadCsvPage>
	<TagManagementPage></TagManagementPage>
	<Page title={'hey there'}></Page>
	<Page title={'hey there 2'}></Page>
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