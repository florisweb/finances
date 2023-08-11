<script>
	import Popup from "./popup.svelte";
	import Header from "../UI/header.svelte";
    import Button from "../UI/button.svelte";

	import { Budget, MonthIdentifier } from "../types";
    import BudgetSection from "../UI/budgetter/budgetSection.svelte";
    import BudgetManager from "../data/budgetManager";
    import MonthInput from "../UI/monthInput.svelte";
    

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
		BudgetManager.add(new Budget(curBudget));
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
		curBudget.sections.splice(_section.index, 1);
		curBudget.sections = curBudget.sections;
	}
</script>

<Popup {isOpen} on:passiveClose={() => isOpen = false} customClass='CreateBudgetPopup'>
	<Header slot='header' title={(inEditMode ? 'Edit' : 'Create') + ' Budget'}></Header>
	<div class='startMonth'><MonthInput></MonthInput>Start</div>
	<div class='endMonth'><MonthInput></MonthInput>End</div>


	<div class='sectionHolder'>
		{#each curBudget.sections as section}
			<BudgetSection section={section} on:delete={() => removeSection(section)}></BudgetSection>
		{/each}
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

	.addSectionButton {
		position: relative;
		margin-left: 6px;
		font-size: 12px;
		color: #444;
		text-transform: uppercase;
		padding: 5px 10px;
		cursor: pointer;
	}
</style>