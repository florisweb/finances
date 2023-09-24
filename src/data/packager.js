import TagManager from './tagManager';
import BudgetManager from './budgetManager';
import TransactionManager from './transactionManager';

class FinancePackage {
	constructor({tags, budgets, transactions} = {}) {
		this.tags = tags ?? [];
		this.budgets = budgets ?? [];
		this.transactions = transactions ?? [];
	}

	toString() {
		return JSON.stringify(this);
	}
	fromString(_str) {
		let data = JSON.parse(_str);
		this.tags = data.tags ?? [];
		this.budgets = data.budgets ?? [];
		this.transactions = data.transactions ?? [];
		return this;
	}
}


const Packager = new class {
	import(_string) {
		return new Promise((resolve, error) => {
			try {
				let pack = new FinancePackage().fromString(_string);
				console.warn(pack);
				TagManager.importData(pack.tags)
				BudgetManager.importData(pack.budgets)
				TransactionManager.importData(pack.transactions)
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
			transactions: TransactionManager.data.map(point => point.export())
		}).toString();
	}
}

export default Packager;