<script>
	import BudgetRow from './budgetRow.svelte';
	import TagManager from "../../data/tagManager";
    import Input from '../input.svelte';
    import DropDown from '../dropDown.svelte';
	import Tag from '../tag.svelte';

	export let section;

	let tags = [];
	TagManager.dataStore.subscribe((_tags) => tags = _tags);
	
	let availableTags = tags;
	$: availableTags = tags.filter((_tag) => !section.tagBudgetSets.find((_set) => _set.tagId === _tag.id) && !_tag.isNonAssignedTag);

	function addBudgetRow(_tagId) {
		let tagSet = {
			tagId: _tagId,
			budget: null
		};
		section.tagBudgetSets = [...section.tagBudgetSets, tagSet];
	}
	function removeBudgetRow(_tagId) {
		let index = section.tagBudgetSets.findIndex(
			(_budgetSet) => _budgetSet.tagId === _tagId
		);
		section.tagBudgetSets.splice(index, 1);
		section.tagBudgetSets = section.tagBudgetSets;
	}
</script>

<div class='section'>
	<div class='budgetSetHolder'>
		<table class='table'>
			<tr>
				<td><Input value={section.name} isInvisibleInput={true} customClass='header'></Input></td>
				<td></td>
				<td>X</td>
			</tr>

			{#each section.tagBudgetSets as budgetSet}
				<BudgetRow 
					tag={TagManager.getById(budgetSet.tagId)} 
					bind:budget={budgetSet.budget} 
					on:delete={() => removeBudgetRow(budgetSet.tagId)}></BudgetRow>
			{/each}

			{#if (availableTags.length > 0)}
				<tr class='addRowButton' >
					<td class='addText'>+ Add budget for tag</td>
					<td>
						<DropDown options={availableTags.map((_tag) => {
							return {
								value: _tag.id,
								contentHTML: {
									component: Tag,
									config: _tag
								}
							}
						})} on:change={(_event) => addBudgetRow(_event.detail)}></DropDown>
					</td>
					<td></td>
				</tr>
			{/if}
		</table>
	</div>
</div>

<style>

	.section {
		padding: 10px;
		margin: 10px 0;
		border: 1px solid #eee;
	}

	.budgetSetHolder {
		position: relative;
		width: 100%;
		height: auto;
	}

	.table {
		width: 100%;
	}


	.addRowButton {
		position: relative;
		height: 45px;
		width: 100%;
		padding-top: 5px;

		display: flex;
	}
	.addRowButton .addText {
		color: #444;
		font-size: 14px;
		line-height: 35px;
		margin-right: 10px;
	}
	
</style>