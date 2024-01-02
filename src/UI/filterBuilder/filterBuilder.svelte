<script>
	import { TagFilter } from '../../types.js';
    import Button from '../button.svelte';
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

	function removeSet(_set) {
		filter.value.splice(_set.index, 1);
		filter.value = filter.value;
	}
	function addSet() {
		filter.value = [...filter.value, [['description', 'includes', null]]];
	}
	$: filter.value = filter.value.map((_ANDSet, _index) => {_ANDSet.index = _index; return _ANDSet});
</script>

<div class='tagFilterSection'>
	<div class='header'>Transaction-classifier filter</div>
	<div class='statementHolder'>
		{#each filter.value as ANDSet}
			<FilterSection bind:ANDSet={ANDSet} on:delete={() => removeSet(ANDSet)}></FilterSection>
		{/each}
	</div>

	<Button name='+ Add AND Set' on:click={addSet}></Button>
</div>


<style>
	.header {
		margin-bottom: 5px;
		font-size: 12px;
		text-transform: uppercase;
	}

	.statementHolder {
		overflow: auto;
		max-height: calc(95vh - 400px);
	}
</style>