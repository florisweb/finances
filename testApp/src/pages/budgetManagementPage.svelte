<script>
	import Page from "../UI/page.svelte";
	// import AddTagPanel from "../UI/addTagPanel.svelte";
	import { getContext } from 'svelte';
	const App = getContext('App');

	// let tags = [];
	// TagManager.dataStore.subscribe((_tags) => tags = _tags);
</script>

<Page title="Budget Management">
	<div class='tagListHolder'>
		<!-- {#each tags as tag} -->
			<!-- <TagPanel tag={tag} on:click={() => {if (!tag.isNonAssignedTag) App.createTagPopup.openEdit(tag)}}></TagPanel> -->
		<!-- {/each} -->

		<!-- <AddTagPanel></AddTagPanel> -->
	</div>
</Page>

<style>
	.tagListHolder {
		position: relative;
		margin: 20px;

		display: grid;
		grid-template: repeat(10, auto) / repeat(3, calc((100% - 40px * 2) / 3));
		grid-gap: 40px;
	}
</style>