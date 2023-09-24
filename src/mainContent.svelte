<script>
	import TagManagementPage from "./pages/tagManagementPage.svelte";
	import MonthOverviewPage from "./pages/monthOverviewPage.svelte";
	import BudgetManagementPage from './pages/budgetManagementPage.svelte';
    import DataManagementPage from "./pages/dataManagementPage.svelte";
	import TagPage from './pages/tagPage.svelte';
</script>

<div id='mainContent'>
	<DataManagementPage></DataManagementPage>
	<TagManagementPage></TagManagementPage>
	<MonthOverviewPage></MonthOverviewPage>
	<BudgetManagementPage></BudgetManagementPage>
	<TagPage></TagPage>
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