
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
		return LocalDB.setData(this.type, this.data.map(t => t.export()));
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
			if (transaction.typeCode !== _tagId && !(_tagId === undefined && transaction.typeCode === 0)) continue;
			found.push(transaction);
		}
		return found;
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