<script>
	import Popup from "./popup.svelte";
	import Header from "../UI/header.svelte";
	import TransactionTable from '../UI/transactionTable.svelte';
	import SearchField from '../UI/searchField.svelte';
    import Button from "../UI/button.svelte";
	import { wait } from "../polyfill";


	const transactionsPerPage = 50;


	let isOpen = false;
	let transactions = [];
	let title = 'Transaction viewer';

	let pages = [];
	let curPageTransactions = [];
	let curPageIndex = 0;
	$: {
		pages = [];
		for (let i = 0; i < transactions.length; i += transactionsPerPage)
		{
			pages = [...pages, transactions.slice(i, i + transactionsPerPage)];
		}
	}

	$: curPageTransactions = pages[curPageIndex] || [];

	export function open(_transactions, _customTitle) {
		isOpen = true;
		transactions = Object.assign([], _transactions); // Keep references to the items intact, but destroy the reference to the array so it can be resorted without affecting the rest of the application
		transactions.sort((a, b) => a.date.getTime() < b.date.getTime());
		title = _customTitle ?? 'Transaction Viewer';
		curPageIndex = 0;
	}
	export async function close() {
		isOpen = false;
		await wait(300);
		curPageTransactions = [];
	}
</script>

<Popup {isOpen} customClass='TransactionViewerPopup' on:passiveClose={() => isOpen = false}>
	<Header slot='header' title={title}></Header>
	<div class="searchFieldHolder">
		<SearchField></SearchField>
	</div>
	<div class='transactionHolder'>
		{#if (curPageTransactions.length === 0)}
			<div class='noTransactionsText'>No Transactions to show</div>
		{:else}
			<TransactionTable transactions={curPageTransactions}></TransactionTable>
		{/if}
		
	</div>
	<div class='buttonHolder'>
		{#if pages.length > 1}
			<div class='navigatorHolder'>
				<Button name='<' on:click={() => curPageIndex > 0 ? curPageIndex-- : false} disabled={curPageIndex === 0}></Button>
				<Button name={`${curPageIndex + 1}/${pages.length}`} on:click={() => curPageIndex = 0}></Button>
				<Button name='>' on:click={() => curPageIndex < pages.length - 1 ? curPageIndex++ : false} disabled={curPageIndex === pages.length - 1}></Button>
			</div>
		{/if}
		<Button name='Close' filled={true} on:click={close}></Button>
	</div>
</Popup>

<style>
	.buttonHolder {
		display: flex;
		flex-direction: row-reverse;
	}

	.navigatorHolder {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
	}

	.transactionHolder {
		margin-top: 3px;
		padding-top: 10px;
		padding-bottom: 10px;
		max-height: calc(90vh - 100px);
		overflow: auto;
	}
	.noTransactionsText {
		text-align: center;
		width: 100%;
		padding: 50px;
		font-size: 20px;
	}

	.searchFieldHolder {
		position: absolute;
		right: 30px;
		top: 20px;
		width: 20%;
	}
</style>