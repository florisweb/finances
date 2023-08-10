<script>
	import SideBar from "./sideBar.svelte";
	import MainContent from "./mainContent.svelte";
    import CreateTagPopup from "./popups/createTagPopup.svelte";
	import TransactionViewerPopup from "./popups/transactionViewerPopup.svelte";
    import { setContext } from "svelte";
    import CreateBudgetPopup from "./popups/createBudgetPopup.svelte";

	let App = {}
	window.App = App;
	setContext('App', App);
	$: App.createTagPopup = createTagPopup;
	$: App.transactionViewerPopup = transactionViewerPopup;
	$: App.createBudgetPopup = createBudgetPopup;

	let createTagPopup;
	let transactionViewerPopup;
	let createBudgetPopup;
</script>
<main>
	<SideBar></SideBar>
	<MainContent></MainContent>

	<CreateTagPopup bind:this={createTagPopup}></CreateTagPopup>
	<TransactionViewerPopup bind:this={transactionViewerPopup}></TransactionViewerPopup>
	<CreateBudgetPopup bind:this={createBudgetPopup}></CreateBudgetPopup>
</main>