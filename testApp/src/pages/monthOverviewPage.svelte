<script>
	import Page from "../UI/page.svelte";
	import { MonthIdentifier } from "../types";
	import TagManager from '../data/tagManager';
    import TagOverviewPanel from "../UI/tagOverviewPanel.svelte";

	export let curMonth = new MonthIdentifier();


	let tags = [];
	TagManager.dataStore.subscribe((_tags) => tags = _tags);
</script>

<Page>
	<div class='infoHolder'>
		Date: {curMonth.name}
	</div>

	<div class='tagListHolder'>
		{#each tags as tag}
			<TagOverviewPanel {...tag}></TagOverviewPanel>
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