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

	<div class='loaderScreen'>
		<div class='logoHolder'>
			<img src='images/logo.png'>
			<div>Finances</div>
		</div>
	</div>
</main>

<style>
	.loaderScreen {
		position: fixed;
		left: 0;
		top: 0;
		width: 100vw;
		height: 100vh;
		background-color: #fff;
		
		display: flex;
		z-index: 1000;

		animation: .5s hideLoadScreen;
		animation-delay: .3s;
		animation-fill-mode: forwards;
	}

	@keyframes hideLoadScreen {
		0% {
			opacity: 1;
			transform: scale(1);
		}
		100% {
			transform: scale(1.5);
			opacity: 0;
			pointer-events: none;
		}
	}


	.logoHolder {
		margin: auto;
		animation: .5s animateLogo;
		animation-fill-mode: forwards;
	}
	.logoHolder div {
		margin-top: 10px;
		text-align: center;
		color: #daf;
		width: auto;
	}

	.loaderScreen img {
		width: 100px;
		height: auto;
	}

	@keyframes animateLogo {
		0% {
			transform: scale(1) translateY(10px);
			opacity: .5;
		}
		100% {
			transform: scale(1.1) translateY(-10px);
			opacity: 1;
		}
	}
</style>