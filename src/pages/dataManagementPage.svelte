<script>
	import Page from "../UI/page.svelte";
	import { downloadFile } from '../polyfill';
	import { CSVFileManager, readFile } from '../CSV.js';
	import { Transaction } from '../types.js';
	import TransactionManager from '../data/transactionManager';
	import AccountManager from '../data/accountManager';
	import Packager from '../data/packager';
    import Button from "../UI/button.svelte";
	
	import { getContext } from 'svelte';
	const App = getContext('App');


	const BankExportRowKeys = ['date', 'ownIBAN', 'targetIBAN', 'targetName', null, null, null, 'unit', 'balance', 'unit2', 'deltaMoney', 'date2', 'date3', 'bankClassification', null, null, null, 'description', null]
	const CSVReader = new CSVFileManager(BankExportRowKeys);

	

	async function handleUpload(_event) {
		if (!_event.target) throw new Error('null input')
	  	const [file] = _event.target.files;
		if (!file) return;
		if (file.type === 'text/csv') {
			await handleCSVUpload(file);
		} else await handleFinancePackageUpload(file);
		
		if (!TransactionManager.data.length) return;
		let result = await TransactionManager.autoClassifyTransactions();
		App.statusMessage.open('Classified ' + result.newClassifies + ' new transactions (' + Math.round(result.classifies / TransactionManager.data.length * 1000) / 10 + '% classified)')
	}

	async function handleCSVUpload(_file) {
		let rows = await CSVReader.load(_file);
		let transactions = rows.map(row => new Transaction(row));
		await TransactionManager.add(transactions);
		AccountManager.reEvaluateAccounts();
	}
	async function handleFinancePackageUpload(_file) {
		let data = await readFile(_file);
		await Packager.import(data).then(
			() => App.statusMessage.open('Succesfully imported the .finance file.'),
			(_error) => App.statusMessage.open(_error)
		);
		AccountManager.reEvaluateAccounts();
	}



	let transactions = [];
	TransactionManager.dataStore.subscribe((_transactions) => transactions = _transactions)
</script>

<Page title="Data Management">
	<div class='message'>
		Download your transactions as .csv on your banks' website and upload them here. <br>Alternatively, upload a previously downloaded .finance-file.
	</div>

	<input type='file' class='CSVInputField' accept='text/csv, text/finance' on:input={handleUpload}>

	<Button	name="Clear Transactions" on:click={() => TransactionManager.clear()}></Button>
	<Button	name="Download Package" on:click={() => downloadFile(Packager.export(), 'output.finance', 'text/finance')}></Button>
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

	.message {
		width: 100%;
		color: #444;
		text-align: center;
	}
</style>