import { readonly, writable } from 'svelte/store';	

const dataWriteStore = writable([]);
import LocalDB from './localDB.js';

export default class DataManager {
	type;
	#typeClass;
	_data = [];
	dataStore = readonly(dataWriteStore);;

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
		LocalDB.ready().then(() => this.setup());
	}

	async setup() {
		let response = await LocalDB.getData(this.type);
		if (!response) return console.warn('An error accured while loading ', this.type, response);
		this._data = response.map(t => new this.#typeClass(t));
		dataWriteStore.set(this._data);
	}


	async writeData() {
		dataWriteStore.set(this._data);
		this.dataCount = this._data.length;
		this._data.length = this._data.length;
		return LocalDB.setData(this.type, this._data.map(t => t.export()));
	}

	async clear() {
		this._data = [];
		return this.writeData();
	}
}

