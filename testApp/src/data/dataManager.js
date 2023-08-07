import LocalDB from './localDB.js';

export default class DataManager {
	type;
	#typeClass;
	_data = [];

	dataCount = 0;

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
		this.dataCount = this._data.length;
		this._data.length = this._data.length;
	}


	async writeData() {
		this.dataCount = this._data.length;
		this._data.length = this._data.length;
		return LocalDB.setData(this.type, this._data.map(t => t.export()));
	}

	async clear() {
		this._data = [];
		return this.writeData();
	}
}

