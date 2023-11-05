<script>
	import { openPageByIndex } from './App.js';
	import Button from './UI/button.svelte';

	import AccountManager from './data/accountManager.js';
	let accounts = [];
	AccountManager.dataStore.subscribe((_accounts) => accounts = _accounts);

	import { getContext } from "svelte";
	const App = getContext('App');
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
		<Button name='Budgetter' on:click={() => openPageByIndex(3)}></Button>
	</div>
	<hr style='border-top: 1px solid #daf; margin-bottom: 20px;'>
	<div class="item header">
		Accounts
	</div>
	{#each accounts as account}
		<div class="item account">
			<Button name={account.name || 'Unnamed Account'} on:click={
				() => App.accountPage.open(account)
			}></Button>
		</div>
	{/each}
	<hr style='border-top: 1px solid #daf; margin-bottom: 20px;'>
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
	/* .item .button {
		margin: 0;
		transition: background .3s, padding-right .3s;
	}
	.item .button:after { 
		position: absolute;
		content: '⚠';
		opacity: 0;
		margin-left: -30px;
		transition: opacity .3s;
	}

	.item .button.warning {
		background: var(--warningColor);
		padding-right: 30px;
	}
	.item .button.warning:after {
		content: '⚠';
		opacity: 1;
		margin-left: 5px;
	} */
	
</style>