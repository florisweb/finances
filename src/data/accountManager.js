import DataManager from "./dataManager";
import TransactionManager from "./transactionManager";
import { BankAccount } from '../types';

const AccountManager = new class extends DataManager {
	constructor() {
		super({type: "accounts", dataToObject: function (_account) {
			return new BankAccount(_account);
		}});
		window.AccountManager = this;
	}

	getByIBAN(_IBAN) {
		return this._data.find((_account) => _account.IBAN === _IBAN);
	} 

	add(_account) {
		let found = this.getByIBAN(_account.IBAN);
		if (found)
		{
			found.name = _account.name;
		} else this._data.push(_account);
		return this.writeData();
	}

	reEvaluateAccounts() {
		let actualIBANs = {};
		TransactionManager._data.forEach(transaction => {
			actualIBANs[transaction.ownIBAN] = true;
		});

		let IBANs = Object.keys(actualIBANs);
		for (let IBAN of IBANs)
		{
			if (this.getByIBAN(IBAN)) continue;
			this.add(new BankAccount({IBAN: IBAN, name: IBAN}));
		}
	}
}

export default AccountManager;