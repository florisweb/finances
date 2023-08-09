<script>
	import SideBar from "./sideBar.svelte";
	import MainContent from "./mainContent.svelte";
    import CreateTagPopup from "./popups/createTagPopup.svelte";
</script>
<main>
	<SideBar></SideBar>
	<MainContent></MainContent>

	<CreateTagPopup isOpen={true}></CreateTagPopup>
</main>