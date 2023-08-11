<script>
	import Popup from "./popup.svelte";
	import Header from "../UI/header.svelte";
    import Button from "../UI/button.svelte";

	import { Budget, MonthIdentifier } from "../types";
    import BudgetSection from "../UI/budgetter/budgetSection.svelte";
    

	let isOpen = false;
	let inEditMode = false;
	let curBudget = new Budget({});

	export function open() {
		isOpen = true;
		inEditMode = false;
		curBudget = new Budget({
			startMonthId: new MonthIdentifier(),
			sections: [
				{
					name: 'default', 
					tagBudgetSets: []
				}
			]
		});
	}
	export function close() {
		isOpen = false;
		inEditMode = false;
	}
	export function openEdit(_budget) {
		isOpen = true;
		inEditMode = true;
		curBudget = Object.assign({}, _budget);
	}

	function save() {
		close();
	}


	function addBudgetSection() {
		let section = {
			name: null, 
			tagBudgetSets: [],
		}
		curBudget.sections = [...curBudget.sections, section];
	}
	
	$: curBudget.sections = curBudget.sections.map((_section, i) => {_section.index = i; return _section});
	function removeSection(_section) {
		console.log(curBudget.sections, _section);
		curBudget.sections.splice(_section.index, 1);
		curBudget.sections = curBudget.sections;
	}
</script>

<Popup {isOpen} on:passiveClose={() => isOpen = false} customClass='CreateBudgetPopup'>
	<Header slot='header' title={(inEditMode ? 'Edit' : 'Create') + ' Budget'}></Header>
	<div class='sectionHolder'>
		{#each curBudget.sections as section}
			<BudgetSection section={section} on:delete={() => removeSection(section)}></BudgetSection>
		{/each}
		<br>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div class='addSectionButton' on:click={() => addBudgetSection()}>+ Add Section</div>
	</div>

	<div class='buttonHolder'>
		<Button name='Save' on:click={() => save()}></Button>
		<Button name='Cancel' filled={false} on:click={() => close()}></Button>
	</div>
</Popup>

<style>
	.buttonHolder {
		display: flex;
		flex-direction: row-reverse;
	}

	.sectionHolder {
		position: relative;
		margin-top: 5px;
		padding-top: 15px;

		height: auto;
		max-height: calc(90vh - 100px);
		overflow: auto;
	}
</style>