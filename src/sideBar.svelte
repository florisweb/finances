<script>
	import { openPageByIndex } from './App.js';
	import Button from './UI/button.svelte';

	import BudgetManager from './data/budgetManager.js';
	let activeBudget;
	BudgetManager.dataStore.subscribe((_budgets) => activeBudget = BudgetManager.activeBudget);

	import AccountManager from './data/accountManager.js';
	let accounts = [];
	AccountManager.dataStore.subscribe((_accounts) => accounts = _accounts);

	import { getContext } from "svelte";
	const App = getContext('App');

	const AccountLogoPaths = {
		'ASN': './images/ASNLogo.png',
		'REVOLUT': './images/RevolutLogo.png',
		'FUND': './images/fundLogo.png',
	}
</script>

<div id='sideBar'>
	<div class="item appLogo">
		<div class='appLogo'>
			FinanceManager
		</div>
	</div>
	<div class="item">
		<Button name='Overview' on:click={() => openPageByIndex(4)}></Button>
	</div>
	<div class="item">
		<Button name='Month Overview' on:click={() => openPageByIndex(2)}></Button>
	</div>
	<div class="item">
		<Button name='Tags' on:click={() => openPageByIndex(1)}></Button>
	</div>
	<div class="item">
		<Button name='Budgetter' customClass={activeBudget ? '' : 'warning'} on:click={() => openPageByIndex(3)}></Button>
	</div>
	{#if accounts.length}
		<hr>
		<div class="item header">
			Accounts
		</div>
	{/if}
	{#each accounts as account}
		<div class="item account">
			<Button name={account.name || 'Unnamed Account'} icon={AccountLogoPaths[account.type]} on:click={
				() => App.accountPage.open(account)
			}></Button>
		</div>
	{/each}
	<hr>
	<div class="item">
		<Button name='Data Management' on:click={() => openPageByIndex(0)}></Button>
	</div>
</div>

<style>
	#sideBar {
		position: absolute;
		left: 0;
		top: 0;
		height: 100vh;
		width: calc(var(--sideBarWidth));

		padding: 20px;
		border-right: 2px dashed #daf;
	}

	.item {
		margin-bottom: 20px;
	}
	.item.header {
		margin-bottom: 5px;
		text-transform: uppercase;
		font-size: 12px;
		color: #daf;
		font-style: italic;
	}

	.item.appLogo {
		margin-bottom: 40px;
	}
	.item .appLogo {
		color: #daf; 
		font-size: 20px; 
		margin-bottom: 20px;
		text-transform: uppercase;
		font-style: italic;
	}
	
	.item > .appLogo::after {
		position: absolute;
		left: 25px;
		top: 45px;
		content: '';
		width: 100px;
		height: 3px;
		background: #daf;
	}


	.item.account {
		margin-bottom: 10px;
	}

	hr {
		border-top: 1px solid #daf; 
		margin-bottom: 20px;
	}
</style>