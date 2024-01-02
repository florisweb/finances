<script>
	import SideBar from "./sideBar.svelte";
	import MainContent from "./mainContent.svelte";
    import CreateTagPopup from "./popups/createTagPopup.svelte";
	import TransactionViewerPopup from "./popups/transactionViewerPopup.svelte";
    import { setContext } from "svelte";
    import CreateBudgetPopup from "./popups/createBudgetPopup.svelte";
    import StatusMessage from "./UI/statusMessage.svelte";
    import CreateAccountPopup from "./popups/createAccountPopup.svelte";

	let App = {}
	window.App = App;
	setContext('App', App);
	$: App.createTagPopup = createTagPopup;
	$: App.transactionViewerPopup = transactionViewerPopup;
	$: App.createBudgetPopup = createBudgetPopup;
	$: App.createAccountPopup = createAccountPopup;
	$: App.statusMessage = statusMessage;
	
	let createTagPopup;
	let transactionViewerPopup;
	let createBudgetPopup;
	let createAccountPopup;
	let statusMessage;
</script>
<main>
	<SideBar></SideBar>
	<MainContent></MainContent>
	<StatusMessage bind:this={statusMessage}></StatusMessage>

	<CreateTagPopup bind:this={createTagPopup}></CreateTagPopup>
	<TransactionViewerPopup bind:this={transactionViewerPopup}></TransactionViewerPopup>
	<CreateBudgetPopup bind:this={createBudgetPopup}></CreateBudgetPopup>
	<CreateAccountPopup bind:this={createAccountPopup}></CreateAccountPopup>
</main>