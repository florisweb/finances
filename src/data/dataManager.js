import { readonly, writable } from 'svelte/store';	

import LocalDB from './localDB.js';

export default class DataManager {
	type;
	#dataToObject;
	_data = [];
	#dataWriteStore = writable([]);
	dataStore = readonly(this.#dataWriteStore);

	get data() {
		return this._data;
	}

	set data(_data) {
		this._data = _data;
		this.writeData();
	}

	set(_data) {
		this._data = _data;
		return this.writeData();
	}

	constructor({type, dataToObject}) {
		this.type = type;
		this.#dataToObject = dataToObject;
		LocalDB.ready().then(() => this.setup());
	}

	async setup() {
		let response = await LocalDB.getData(this.type);
		if (!response) return console.warn('An error accured while loading ', this.type, response);		
		this.importData(response, false);
	}

	importData(_data, _write = true) {
		this._data = _data.map(dataPoint => this.#dataToObject(dataPoint));
		this._setStore(this._data);
		if (_write) return this.writeData();
	}


	async writeData() {
		this._setStore(this._data);
		this._data.length = this._data.length;
		return LocalDB.setData(this.type, this._data.map(t => t.export()));
	}

	_setStore(_data) {
		this.#dataWriteStore.set(_data);
	}

	async clear() {
		this._data = [];
		return this.writeData();
	}
}

