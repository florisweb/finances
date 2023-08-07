import DataManager from "./dataManager";
import { Transaction } from "../types";

const TransactionManager = new class extends DataManager {
	constructor() {
		super({type: "transactions", dataToObject: (_transaction) => new Transaction(_transaction)});
	}

	set(_transactions) {
		this._data = [];
		for (let ts of _transactions) {
			if (!ts.date || ts.targetIBAN === undefined) continue;
			this._data.push(ts);
		}
		return this.writeData();
	}

	add(_transactions) {
		if (typeof _transactions.length !== 'number') _transactions = [_transactions];
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
}

export default TransactionManager;