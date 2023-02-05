
const DataManager = new class {
	transactions = [];

	constructor() {
		this.#loadTransactions();
	}

	clearTransactions() {
		this.setTransactions([]);
	}
	setTransactions(_transactions) {
		this.transactions = [];
		for (let ts of _transactions) {
			if (!ts.date || ts.targetIBAN === undefined) continue;
			this.transactions.push(ts);
		}
		this.saveTransactions();
	}

	addTransactions(_transactions) {
		for (let ts of _transactions) 
		{
			if (!ts.date || ts.targetIBAN === undefined) continue;
			if (this.transactions.find((_ts) => _ts.identifier === ts.identifier) !== undefined) continue;
			this.transactions.push(ts);
		}
		this.saveTransactions();
	}

	getByTag(_tagId) {
		let found = [];
		for (let transaction of this.transactions)
		{
			if (transaction.typeCode !== _tagId) continue;
			found.push(transaction);
		}
		return found;
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

