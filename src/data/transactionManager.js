import DataManager from "./dataManager";
import { Transaction, MonthIdentifier, FundTransaction, FundDividendTransaction } from "../types";
import { openPageByIndex } from "../App";
import AIManager from "./AIManager";

const TransactionManager = new class extends DataManager {
	constructor() {
		super({type: "transactions", dataToObject: (_transaction) => {
				if (FundTransaction.isFundTransaction(_transaction)) return new FundTransaction(_transaction);
				if (FundDividendTransaction.isFundDividend(_transaction)) return new FundDividendTransaction(_transaction);
				return new Transaction(_transaction);
			}
		});
		window.TransactionManager = this;
	}

	#transactionsPerMonth = {};
	async setup() {
		await super.setup();
		this.#catagorizeTransactionsByMonth();
		if (this.data.length === 0) openPageByIndex(0);
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
			if (!ts.date) continue;
			let index = this._data.findIndex((_ts) => _ts.id === ts.id);
			if (index !== -1) continue; // Skip because no differences: would only overwrite the classificationdata
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
	getByAccount(_account, _data = this.data) {
		let IBAN = typeof _account === 'string' ? _account : _account.IBAN;
		return _data.filter((t) => t.ownIBAN === IBAN);
	}


	getByMonth(_monthId) {
		return this.#transactionsPerMonth[_monthId.id] || [];
	}
	getByYear(_year) {
		let transactions = [];
		for (let m = 0; m < 12; m++)
		{
			let monthId = (m + 1) + '/' + _year; 
			transactions = transactions.concat(this.#transactionsPerMonth[monthId] || [])
		}
		return transactions;
	}

	getByMonthAndTag(_monthId, _tagId) {
		return this.getByTag(_tagId, this.getByMonth(_monthId));
	}
	getByYearAndTag(_year, _tagId) {
		return this.getByTag(_tagId, this.getByYear(_year));
	}
	getByMonthAndAccount(_monthId, _account) {
		return this.getByAccount(_account, this.getByMonth(_monthId));
	}


	getOldestTransaction(_transactions) {
		if (_transactions.length === 0 || !_transactions) return false;
		_transactions.sort((a, b) => a.date > b.date);
		let oldestTrans = _transactions[0];
		let possibleLastTransactions = _transactions.filter(t => t.date.toString() === oldestTrans.date.toString());
		let properOrder = this.orderTransactionsWithSameDate(possibleLastTransactions);
		return properOrder[0];
	}
	getNewestTransaction(_transactions) {
		if (_transactions.length === 0 || !_transactions) return false;
		_transactions.sort((a, b) => a.date < b.date);
		let newestTrans = _transactions[0];
		let possibleLastTransactions = _transactions.filter(t => t.date.toString() === newestTrans.date.toString());
		let properOrder = this.orderTransactionsWithSameDate(possibleLastTransactions);
		return properOrder[properOrder.length - 1];
	}
	

	orderTransactionsWithSameDate(_transactions) { 
		// Assuming on the same date
		// Assumes that the balance of a transaction is unique
		let accounts = {};
		for (let trans of _transactions)
		{
			if (!accounts[trans.ownIBAN]) accounts[trans.ownIBAN] = [];
			accounts[trans.ownIBAN].push(trans);
		}

		// Order of transactions from differing accounts does not matter, as they are independent
		let properOrder = [];
		for (let IBAN in accounts)
		{
			const transactions = accounts[IBAN];
			let order = this.#orderTransactionsWithSameDateWithinAccount(transactions);
			properOrder = order.concat(properOrder);
		}

		return properOrder;
	}
	#orderTransactionsWithSameDateWithinAccount(_transactions) { 
		// Sorts from oldest to newest transactions 
		if (_transactions.length <= 1) return _transactions;

		for (let i = 0; i < _transactions.length; i++)
		{
			let balanceAfterTrans = _transactions[i].deltaMoney + _transactions[i].balance;
			for (let t = 0; t < _transactions.length; t++)
			{
				if (t === i) continue;
				if (balanceAfterTrans !== _transactions[t].balance) continue;
				_transactions[i].followingTransaction = _transactions[t];
				_transactions[t].precedingTransaction = _transactions[i];
			}
		}

		const oldestTransactions = _transactions.filter(t => !t.precedingTransaction)
		if (oldestTransactions.length !== 1) return _transactions; // Could not order them
		let properOrder = [oldestTransactions[0]];
		let curTransaction = oldestTransactions[0].followingTransaction;
		while (curTransaction)
		{
			properOrder.push(curTransaction);
			curTransaction = curTransaction.followingTransaction;
		}
		properOrder.forEach((trans) => {
			delete trans.followingTransaction;
			delete trans.precedingTransaction;
		})
		return properOrder;
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