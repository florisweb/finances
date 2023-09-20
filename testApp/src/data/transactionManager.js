import DataManager from "./dataManager";
import { Transaction, MonthIdentifier } from "../types";


const TransactionManager = new class extends DataManager {
	constructor() {
		super({type: "transactions", dataToObject: (_transaction) => new Transaction(_transaction)});
		window.TransactionManager = this;
	}

	#transactionsPerMonth = {};
	async setup() {
		await super.setup();
		this.#catagorizeTransactionsByMonth();
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
			let index = this._data.findIndex((_ts) => _ts.id === ts.id);
			if (index !== -1) 
			{
				this._data[index] = ts;
				continue;
			}
			this._data.push(ts);
		}
		return this.writeData();
	}

	getByTag(_tagId, _data = this.data) {
		let found = [];
		for (let transaction of _data)
		{
			if (
				transaction.typeCode !== _tagId &&
				!(
					_tagId === 0 && (
						transaction.typeCode === undefined || transaction.typeCode === 0
					)
				)
			) continue; 
			found.push(transaction);
		}
		return found;
	}

	getByMonth(_monthId) {
		return this.#transactionsPerMonth[_monthId.id] || [];
	}

	getByMonthAndTag(_monthId, _tagId) {
		return this.getByTag(_tagId, this.getByMonth(_monthId));
	}

	async autoClassifyTransactions() {
		let oldClassifies = 0;
		let newClassifies = 0;
		for (let trans of this._data)
		{
			if (trans.typeCode) oldClassifies++;
			if (trans.classificationState === 2) continue; // Already manually classified

			let type = TagManager.autoDetectTransactionTag(trans);
			if (type === false) continue;
			if (trans.typeCode !== type.id) newClassifies++; // Changed/added the classification

			trans.typeCode = type.id;
			trans.classificationState = 1;
		}
		await this.writeData();

		return {
			newClassifies: newClassifies,
			classifies: oldClassifies + newClassifies,
		}
	}

	writeData() {
		this.#catagorizeTransactionsByMonth();
		return super.writeData();
	}

	#catagorizeTransactionsByMonth() {
		this.#transactionsPerMonth = {};
		for (let transaction of this._data)
		{
			let monthId = new MonthIdentifier().setFromDateString(transaction.date).id;
			if (!this.#transactionsPerMonth[monthId]) this.#transactionsPerMonth[monthId] = [];
			this.#transactionsPerMonth[monthId] = [...this.#transactionsPerMonth[monthId], transaction];
		}
	}
}

export default TransactionManager;