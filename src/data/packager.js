import TagManager from './tagManager';
import BudgetManager from './budgetManager';
import TransactionManager from './transactionManager';
import AccountManager from './accountManager';
import AIManager from './AIManager';

class FinancePackage {
	constructor({tags, budgets, transactions, accounts, neuralNetworks} = {}) {
		this.tags = tags ?? [];
		this.budgets = budgets ?? [];
		this.transactions = transactions ?? [];
		this.accounts = accounts ?? [];
		this.neuralNetworks = neuralNetworks ?? [];
	}

	toString() {
		return JSON.stringify(this);
	}
	fromString(_str) {
		let data = JSON.parse(_str);
		this.tags = data.tags ?? [];
		this.budgets = data.budgets ?? [];
		this.transactions = data.transactions ?? [];
		this.accounts = data.accounts ?? [];
		this.neuralNetworks = data.neuralNetworks ?? [];
		return this;
	}
}


const Packager = new class {
	import(_string) {
		return new Promise((resolve, error) => {
			try {
				let pack = new FinancePackage().fromString(_string);
				TagManager.importData(pack.tags);
				BudgetManager.importData(pack.budgets);
				TransactionManager.importData(pack.transactions);
				AccountManager.importData(pack.accounts);
				if (pack.neuralNetworks) AIManager.importData(pack.neuralNetworks);
			} catch (e) {
				error('Package-import: Invalid JSON:' + e);
			}
			resolve();

		});
	}
	export() {
		return new FinancePackage({
			tags: TagManager.data.map(point => point.export()),
			budgets: BudgetManager.data.map(point => point.export()),
			transactions: TransactionManager.data.map(point => point.export()),
			accounts: AccountManager.data.map(point => point.export()),
			neuralNetworks: AIManager.data.map(point => point.export())
		}).toString();
	}
}

export default Packager;