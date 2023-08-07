<script>
	import Page from "../UI/page.svelte";
	import { CSVFileManager } from '../CSV.js';
	import { Transaction } from '../types.js';
	import TransactionManager from '../data/transactionManager';
	import { transactionStore } from '../data/transactionManager';

	const BankExportRowKeys = ['date', 'senderIBAN', 'targetIBAN', 'targetName', null, null, null, 'unit', 'balance', 'unit2', 'deltaMoney', 'date2', 'date3', 'bankClassification', null, null, null, 'description', null]
	const CSVReader = new CSVFileManager(BankExportRowKeys);

	async function handleCSVUpload(_event) {
		if (!_event.target) throw new Error('null input')
	  	const [firstFile] = _event.target.files
		let rows = await CSVReader.load(firstFile);
		let transactions = rows.map(row => new Transaction(row));
		console.warn('data', transactions);
		TransactionManager.add(transactions);
	}

	let transactions = [];
	transactionStore.subscribe((_transactions) => transactions = _transactions)
</script>

<Page title="Upload CSV">
	<input type='file' class='CSVInputField' accept='text/csv' on:input={handleCSVUpload}>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class='button' on:click={() => TransactionManager.clear()}>
		Clear Data
	</div>
	<div class='transactionCountHolder textHolder'>
		Transactions: {transactions.length}
	</div>
</Page>

<style>
	.CSVInputField {
		margin: 20px;
		width: calc(100% - 20px * 2);
		height: calc(100vh - 50px * 2 - 50px - 200px);

		border: 1px solid #ddd;
		text-align: center;
		padding: 50px;
		border: 1px solid #daf;
	}
</style>