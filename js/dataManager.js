
class DataManager {
	type;
	#typeClass;
	_data = [];

	get data() {
		return this._data;
	}

	set data(_data) {
		this._data = _data;
		this.writeData();
	}

	constructor({type, typeClass}) {
		this.type = type;
		this.#typeClass = typeClass;
	}

	async setup() {
		let response = await LocalDB.getData(this.type);
		if (!response) return console.warn('An error accured while loading ', this.type, response);
		this._data = response.map(t => new this.#typeClass(t));
	}


	async writeData() {
		return LocalDB.setData(this.type, this._data.map(t => t.export()));
	}

	async clear() {
		this._data = [];
		return this.writeData();
	}
}






const TransactionManager = new class extends DataManager {
	constructor() {
		super({type: "transactions", typeClass: Transaction});
	}


	setTransactions(_transactions) {
		this._data = [];
		for (let ts of _transactions) {
			if (!ts.date || ts.targetIBAN === undefined) continue;
			this._data.push(ts);
		}

		return this.writeData();
	}

	addTransactions(_transactions) {
		for (let ts of _transactions) 
		{
			if (!ts.date || ts.targetIBAN === undefined) continue;
			if (this.data.find((_ts) => _ts.identifier === ts.identifier) !== undefined) continue;
			this._data.push(ts);
		}
		return this.writeData();
	}

	getByTag(_tagId) {
		let found = [];
		for (let transaction of this.data)
		{
			if (transaction.typeCode !== _tagId && !(_tagId === 0 && (transaction.typeCode === undefined || transaction.typeCode === 0))) continue; 
			found.push(transaction);
		}
		return found;
	}

	async autoClassifyTransactions() {
		let classifies = 0;
		let newClassifies = 0;
		for (let trans of this._data)
		{
			if (trans.typeCode !== undefined) classifies++;
			if (trans.classificationState === 2) continue; // Already manually classified

			let type = TagManager.autoDetectTransactionTag(trans);
			if (type === false) continue;
			if (trans.typeCode !== type) newClassifies++; // Changed/added the classification

			trans.typeCode = type;
			trans.classificationState = 1;
		}
		await this.writeData();

		App.statusMessage.open('Classified ' + newClassifies + ' new transactions (' + Math.round(classifies / this._data.length * 1000) / 10 + '% classified)')
		return classifies;
	}



	downloadCSV() {
		let data = [];
		for (let transaction of this.data) 
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