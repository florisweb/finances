
const DataManager = new class {
	transactions = [];

	async setup() {
		await this.#loadTransactions();
	}

	clearTransactions() {
		return this.setTransactions([]);
	}
	setTransactions(_transactions) {
		this.transactions = [];
		for (let ts of _transactions) {
			if (!ts.date || ts.targetIBAN === undefined) continue;
			this.transactions.push(ts);
		}
		return this.saveTransactions();
	}

	addTransactions(_transactions) {
		for (let ts of _transactions) 
		{
			if (!ts.date || ts.targetIBAN === undefined) continue;
			if (this.transactions.find((_ts) => _ts.identifier === ts.identifier) !== undefined) continue;
			this.transactions.push(ts);
		}
		return this.saveTransactions();
	}

	getByTag(_tagId) {
		let found = [];
		for (let transaction of this.transactions)
		{
			if (transaction.typeCode !== _tagId && !(_tagId === undefined && transaction.typeCode === 0)) continue;
			found.push(transaction);
		}
		return found;
	}


	saveTransactions() {
		return LocalDB.setData('transactions', this.transactions.map(t => t.export()));
	}

	async #loadTransactions() {
		try {
			let response = await LocalDB.getData('transactions');
			if (!response) return;
			this.transactions = response.map(t => new Transaction(t));
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

