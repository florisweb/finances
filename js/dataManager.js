
const DataManager = new class {
	transactions = [];

	constructor() {
		this.#loadTransactions();
	}

	setTransactions(_transactions) {
		this.transactions = _transactions;
		this.saveTransactions();
	}

	saveTransactions() {
		localStorage.transactions = JSON.stringify(this.transactions.map(t => t.export()));
	}

	#loadTransactions() {
		try {
			this.transactions = JSON.parse(localStorage.transactions).map(t => new Transaction(t));
		} catch (e) {
			console.warn('DataManager, importError:', e);
		};
	}

	downloadCSV() {
		let data = [];
		for (let transaction of this.transactions) 
		{
			data.push([
				transaction.date,
				transaction.typeCode,
				transaction.targetIBAN,
				transaction.targetName,
				transaction.deltaMoney,
				transaction.description
			].join(','))
		}

		downloadCSV(data.join('\n'));
	}
}

