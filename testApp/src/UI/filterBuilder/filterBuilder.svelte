<script>
	import { TagFilter } from '../../types.js';
    import FilterSection from './filterSection.svelte';
	export let filter = new TagFilter([
		[
			['description', 'includes', 'Jumbo'],
			['description', 'includes', 'Supermarket'],
		],
		[
			['description', 'includes', 'Jumbo'],
			['description', 'includes', 'Supermarket'],
		]
	]);
</script>

<div class='tagFilterSection'>
	<div class='header'>Transaction-classifier filter</div>
	<div class='statementHolder'>
		{#each filter.value as ANDSet}
			<FilterSection {ANDSet}></FilterSection>
		{/each}
	</div>
</div>


<style>
	.header {
		margin-bottom: 5px;
		font-size: 12px;
	}

	.statementHolder {
		overflow: auto;
	}
</style>