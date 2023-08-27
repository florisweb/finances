<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
    import FilterRule from './filterRule.svelte';
	export let ANDSet = [];

	function addRule() {
		ANDSet = [...ANDSet, ['description', 'contains', null]];
	}
	function removeRule(_rule) {
		ANDSet.splice(_rule.index, 1);
		ANDSet = ANDSet;
	}

	$: ANDSet = ANDSet.map((_rule, _index) => {_rule.index = _index; return _rule});
	$: if (ANDSet.length === 0) dispatch('delete');
</script>

<div class='tagFilterSection'>
	{#each ANDSet as rule}
		<FilterRule {rule} on:addRule={addRule} on:delete={() => removeRule(rule)}></FilterRule>
	{/each}
</div>

<style>
	.tagFilterSection {
		display: flex;
		flex-direction: column;
  		border-left: 3px solid #daf;
  		margin-bottom: 15px;
		animation: animateIn .3s;
	}
	
	@keyframes animateIn {
		0% {
			opacity: 0;
			margin-top: -50px;
		}
		100% {
			opacity: 1;
			margin-top: 0;
		}
	}
</style>