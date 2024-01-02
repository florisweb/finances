<script>
	import Page from "../UI/page.svelte";
	import BudgetPanel from '../UI/budgetPanel.svelte';
	
	// import AddTagPanel from "../UI/addTagPanel.svelte";
	import { getContext } from 'svelte';
    import BudgetManager from "../data/budgetManager";
    import AddBudgetPanel from "../UI/addBudgetPanel.svelte";
    import { Budget, MonthIdentifier } from "../types";
	const App = getContext('App');

	let budgets = [];
	BudgetManager.dataStore.subscribe((_budgets) => {
		budgets = _budgets
		budgets.sort((a, b) => a.startMonthId.date.getTime() > b.startMonthId.date.getTime());
	});

	function duplicateActiveBudget() {
		let newBudget = new Budget({
			startMonthId: new MonthIdentifier(), 
			sections: BudgetManager.activeBudget.sections.map(s => s.export())
		});
		console.warn(window.newBudget = newBudget);
		App.createBudgetPopup.openEdit(newBudget);
	}
</script>

<Page title="Budget Management">
	<div class='listHolder'>
		{#each budgets as budget}
			<BudgetPanel budget={budget} on:click={() => App.createBudgetPopup.openEdit(budget)}></BudgetPanel>
		{/each}

		<AddBudgetPanel on:click={() => App.createBudgetPopup.open()} on:clickButton={() => duplicateActiveBudget()}></AddBudgetPanel>
	</div>
</Page>

<style>
	.listHolder {
		position: relative;
		margin: 20px;

		display: grid;
		grid-template: repeat(10, auto) / repeat(3, calc((100% - 40px * 2) / 3));
		grid-gap: 40px;
	}
</style>