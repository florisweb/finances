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
		window.b = curBudget
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
		if (curBudget.endMonthId &&
			curBudget.startMonthId.date.getTime() > curBudget.endMonthId.date.getTime()
		) return alert('Invalid date-order');
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
	<div class='monthSelectPanel'>
		<div class='header'>Start</div>
		<div class='header'>End</div>
		<div class='monthInput'><MonthInput allowNoDate={false} bind:value={curBudget.startMonthId}></MonthInput></div>
		<div class='monthInput'><MonthInput bind:value={curBudget.endMonthId}></MonthInput></div>
	</div>

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
		padding-top: 15px;

		height: auto;
		max-height: calc(90vh - 160px);
		overflow: auto;
	}

	.addSectionButton {
		position: relative;
		margin-top: 5px;
		margin-left: 6px;
		font-size: 12px;
		color: #444;
		text-transform: uppercase;
		padding: 5px 10px;
		cursor: pointer;
	}

	.monthSelectPanel {
		position: relative;
		margin-top: 10px;
		width: 100%;
		height: auto;
		padding: 10px;
		border: 1px solid #eee;
		
		display: grid;
		grid-template-columns: 50% 50%;
	}
		.monthSelectPanel div {
			width: 50%;
			height: auto;
		}
		.monthSelectPanel div.header {
			font-size: 12px;
			text-transform: uppercase;
			font-style: italic;
			color: #444;
		}
		.monthSelectPanel div.monthInput {
			margin-top: 5px;
		}
</style>