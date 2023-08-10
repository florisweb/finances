<script>
	import UploadCsvPage from "./pages/uploadCSVPage.svelte";
	import TagManagementPage from "./pages/tagManagementPage.svelte";
	import MonthOverviewPage from "./pages/monthOverviewPage.svelte";
	import BudgetManagementPage from './pages/budgetManagementPage.svelte';
</script>

<div id='mainContent'>
	<UploadCsvPage></UploadCsvPage>
	<TagManagementPage></TagManagementPage>
	<MonthOverviewPage></MonthOverviewPage>
	<BudgetManagementPage></BudgetManagementPage>
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