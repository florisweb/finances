<script>
	import Page from "../UI/page.svelte";
	import TransactionTable from "../UI/transactionTable.svelte";
	import { assignableTransactions } from '../App.js';

	let transactions = [];
	assignableTransactions.subscribe((_trans) => {
		transactions = _trans;
	});
</script>

<Page title={`Assign ${transactions.length} transactions`}>
	<TransactionTable {transactions}></TransactionTable>
</Page>

<style>
</style>