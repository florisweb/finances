<script>
	import Page from "../UI/page.svelte";
	import TagPanel from "../UI/tagPanel.svelte";
	import TagManager from '../data/tagManager';

	let tags = [];
	TagManager.dataStore.subscribe((_tags) => {tags = _tags; console.log(_tags)})
</script>

<Page title="Tag Management">
	<div class='tagListHolder'>
		{#each tags as tag}
			<TagPanel {...tag}></TagPanel>
		{/each}
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