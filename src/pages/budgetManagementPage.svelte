<script>
	import Page from "../UI/page.svelte";
	import BudgetPanel from '../UI/budgetPanel.svelte';
	
	// import AddTagPanel from "../UI/addTagPanel.svelte";
	import { getContext } from 'svelte';
    import BudgetManager from "../data/budgetManager";
    import AddBudgetPanel from "../UI/addBudgetPanel.svelte";
    import { Budget, MonthIdentifier } from "../types";
    import Button from "../UI/button.svelte";
	const App = getContext('App');

	let activeBudget;
	let budgets = [];
	BudgetManager.dataStore.subscribe((_budgets) => {
		budgets = _budgets
		budgets.sort((a, b) => a.startMonthId.date.getTime() > b.startMonthId.date.getTime());
		activeBudget = BudgetManager.activeBudget;
	});

	function duplicateActiveBudget() {
		let newBudget = new Budget({
			startMonthId: new MonthIdentifier(), 
			sections: BudgetManager.activeBudget.sections.map(s => s.export())
		});
		App.createBudgetPopup.openEdit(newBudget);
	}

	let budgetRemoverModeEnabled = false;
</script>

<Page title="Budget Management" customClass='budgetPage'>
	<Button name='Toggle budget remover' customClass='removeButton' on:click={() =>budgetRemoverModeEnabled = !budgetRemoverModeEnabled}></Button>
	<div class='message warning' class:hide={activeBudget} transit>No budget active, please add one below.</div>
	<div class='listHolder'>
		{#each budgets as budget}
			<BudgetPanel 
				budget={budget} 
				on:click={() => App.createBudgetPopup.openEdit(budget)} 
				on:clickButton={(_e) => {BudgetManager.remove(budget.id); budgetRemoverModeEnabled = false}}
				showRemoveButton={budgetRemoverModeEnabled}
			></BudgetPanel>
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

	.message {
		width: 100%;
		text-align: center;
		transition: opacity .3s, margin-top .3s;
	}
	.message.hide {
		opacity: 0;
		margin-top: -18px;
		pointer-events: none;
	}
	.message.warning {
		color: var(--warningColor);
	}
</style>