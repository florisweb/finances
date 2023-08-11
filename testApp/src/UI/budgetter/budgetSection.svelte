<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

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


	let sectionSum = 0;
	$: {
		sectionSum = 0;
		if (section.tagBudgetSets.length) sectionSum = section.tagBudgetSets.map((set) => set.budget).reduce((a, b) => a + b);
	}

</script>

<div class='section'>
	<div class='budgetSetHolder'>
		<table class='table'>
			<tr class='tableHeader'>
				<th scope='col' class='name'><Input value={section.name} isInvisibleInput={true} customClass='header'></Input></th>
				<th scope='col' class='income'>In</th>
				<th scope='col' class='budget'>Budget</th>
				<th scope='col' on:click={() => dispatch('delete')}>X</th>
			</tr>

			{#each section.tagBudgetSets as budgetSet}
				<BudgetRow 
					tag={TagManager.getById(budgetSet.tagId)} 
					bind:budget={budgetSet.budget} 
					on:delete={() => removeBudgetRow(budgetSet.tagId)}></BudgetRow>
			{/each}


			<BudgetRow 
					isSumRow={true}
					sum={sectionSum} 
			></BudgetRow>


			{#if (availableTags.length > 0)}
				<tr class='addRowButton' >
					<td class='addText'><div>+</div> Add budget for tag</td>
					<td class='dropDown'>
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
				</tr>
			{/if}
		</table>
	</div>
</div>

<style>

	.section {
		padding: 10px;
		padding-bottom: 0;
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
		border-collapse: collapse;
	}

	.tableHeader th {
		font-weight: normal;
		font-size: 12px;
		font-style: italic;
	}
	.tableHeader .name {
		position: relative;
		left: -5px;
	}
	.tableHeader .budget {
		width: 90px;
		padding-right: 10px;
	}
	.tableHeader .income {
		width: 40px;
		padding-right: 10px;
	}



	.addRowButton {
		position: relative;
		height: 45px;
		width: 100%;
		padding-top: 5px;
	}
		.addRowButton .addText {
			color: #444;
			font-size: 14px;
			line-height: 35px;
			padding-left: 5px;
		}
		.addRowButton .addText div {
			float: left;
			margin-left: -1px;
			margin-right: 10px;
		}

		.addRowButton .dropDown {
			padding-top: 5px;
			position: absolute;
		}
	
</style>