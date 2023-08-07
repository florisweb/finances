import { readonly, writable } from 'svelte/store';	

import LocalDB from './localDB.js';

export default class DataManager {
	type;
	#dataToObject;
	_data = [];
	#dataWriteStore = writable([]);
	dataStore;

	get data() {
		return this._data;
	}

	set data(_data) {
		this._data = _data;
		this.writeData();
	}

	constructor({type, dataToObject}) {
		this.dataStore = readonly(this.#dataWriteStore);
		this.type = type;
		this.#dataToObject = dataToObject;
		LocalDB.ready().then(() => this.setup());
	}

	async setup() {
		let response = await LocalDB.getData(this.type);
		if (!response) return console.warn('An error accured while loading ', this.type, response);		
		this._data = response.map(dataPoint => this.#dataToObject(dataPoint));
		this.#dataWriteStore.set(this._data);
	}


	async writeData() {
		this.#dataWriteStore.set(this._data);
		this.dataCount = this._data.length;
		this._data.length = this._data.length;
		return LocalDB.setData(this.type, this._data.map(t => t.export()));
	}

	async clear() {
		this._data = [];
		return this.writeData();
	}
}

