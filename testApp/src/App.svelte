<script>
	import SideBar from "./sideBar.svelte";
	import MainContent from "./mainContent.svelte";
    import CreateTagPopup from "./popups/createTagPopup.svelte";
    import { setContext } from "svelte";

	let App = {}
	setContext('App', App);
	$: App.createTagPopup = createTagPopup;

	let createTagPopup;
</script>
<main>
	<SideBar></SideBar>
	<MainContent></MainContent>

	<CreateTagPopup bind:this={createTagPopup}></CreateTagPopup>
</main>