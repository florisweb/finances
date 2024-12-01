<script>
	import Page from "../UI/page.svelte";
	import { downloadFile, wait } from '../polyfill';
	import { CSVFileManager, readFile } from '../CSV.js';
	import { Transaction } from '../types.js';
	import TransactionManager from '../data/transactionManager';
	import AccountManager from '../data/accountManager';
	import Packager from '../data/packager';
    import Button from "../UI/button.svelte";

	import { getContext } from 'svelte';
	const App = getContext('App');


	class CSVReader { 
		fileManager;
		constructor(_rowKeys) {
			this.fileManager = new CSVFileManager(_rowKeys);
		}

		async read(_file) {
			let rows = await this.fileManager.load(_file);
			let	transactions = rows.map(row => new Transaction(row));
			return transactions;
		}

		async canRead(_file) {
			return true;
		}
	}

	class ASNReader extends CSVReader {
		constructor() {
			super(['date', 'ownIBAN', 'targetIBAN', 'targetName', null, null, null, 'unit', 'balance', 'unit2', 'deltaMoney', 'date2', 'date3', 'bankClassification', null, null, null, 'description', null]);
		}
		async canRead(_file) {
			let rows = await this.fileManager.load(_file);
			if (!rows.length) return false;
			if (rows[0].date && rows[0].balance && rows[0].deltaMoney && rows[0].description) return true;
			return false
		}
	}

	class RevolutReader extends CSVReader {
		constructor() {
			super([null, null, 'Started Date', 'date', 'description', 'deltaMoney', 'Fee', 'Currency', 'State', 'balance']);
		}

		async read(_file) {
			let rows = await this.fileManager.load(_file);
			rows = rows.filter(row => row.State === "COMPLETED"); // filter out all the reverted/not-yet completed transactions
			let	transactions = rows.map(row => new Transaction(row));
			for (let transaction of transactions) 
			{
				transaction.ownIBAN = 'Revolut';
				transaction.balance -= transaction.deltaMoney; // Balance is the amount of money at the time of the transaction, revolut gives the amount of money after the transaction has taken place: so revert it.
			}
			return transactions.splice(1, Infinity); // Split of the header
		}

		async canRead(_file) {
			let rows = await this.fileManager.load(_file);
			if (!rows.length) return false;
			if (rows[0].date && rows[0].balance && rows[0].deltaMoney && rows[0].description) return true;
			return false;
		}
	}

	const CSVReaders = {
		ASN: new ASNReader,
		Revolut: new RevolutReader
	}

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

	async function findSuitableReader(_file) {
		for (let key in CSVReaders)
		{
			if (await CSVReaders[key].canRead(_file)) return key;
		}
		return false;
	}

	async function handleCSVUpload(_file) {
		let readerType = await findSuitableReader(_file)
		if (!readerType) return App.statusMessage.open('This type of bank-output-file is not supported');
		await App.statusMessage.open(`Detected CSV-file from ${readerType}.`, 500);
		let reader = CSVReaders[readerType];
		let transactions = await reader.read(_file);

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