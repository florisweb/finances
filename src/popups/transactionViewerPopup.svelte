<script>
	import Popup from "./popup.svelte";
	import Header from "../UI/header.svelte";
	import TransactionTable from '../UI/transactionTable.svelte';
    import Button from "../UI/button.svelte";


	let isOpen = false;
	let transactions = [];
	let title = 'Transaction viewer';

	export function open(_transactions, _customTitle) {
		isOpen = true;
		transactions = _transactions;
		title = _customTitle ?? 'Transaction Viewer';
	}
	export function close() {
		isOpen = false;
	}
</script>

<Popup {isOpen} customClass='TransactionViewerPopup' on:passiveClose={() => isOpen = false}>
	<Header slot='header' title={title}></Header>
	<div class='transactionHolder'>
		{#if (transactions.length === 0)}
			<div class='noTransactionsText'>No Transactions to show</div>
		{:else}
			<TransactionTable transactions={transactions}></TransactionTable>
		{/if}
		
	</div>
	<div class='buttonHolder'>
		<Button name='Close' filled={true} on:click={close}></Button>
	</div>
</Popup>

<style>
	.buttonHolder {
		display: flex;
		flex-direction: row-reverse;
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
</style>