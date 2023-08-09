<script>
	import SideBar from "./sideBar.svelte";
	import MainContent from "./mainContent.svelte";
    import CreateTagPopup from "./popups/createTagPopup.svelte";
	import TransactionViewerPopup from "./popups/transactionViewerPopup.svelte";
    import { setContext } from "svelte";

	let App = {}
	setContext('App', App);
	$: App.createTagPopup = createTagPopup;
	$: App.transactionViewerPopup = transactionViewerPopup;

	let createTagPopup;
	let transactionViewerPopup;
</script>
<main>
	<SideBar></SideBar>
	<MainContent></MainContent>

	<CreateTagPopup bind:this={createTagPopup}></CreateTagPopup>
	<TransactionViewerPopup bind:this={transactionViewerPopup}></TransactionViewerPopup>
</main>