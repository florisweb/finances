import DataManager from "./dataManager";
import { Budget } from '../types';
window.Budget = Budget;

const BudgetManager = new class extends DataManager {
	constructor() {
		super({type: "budgets", dataToObject: (_budget) => new Budget(_budget)});
		window.BudgetManager = this;
	}
	getById(_id) {
		return this._data.find((_item) => _item.id === _id);
	}

	add(_items) {
		if (typeof _items.length !== 'number') _items = [_items];
		for (let budget of _items) 
		{
			let index = this._data.findIndex((_item) => _item.id === budget.id);
			if (index !== -1) 
			{
				this._data[index] = budget;
				continue;
			}
			this._data.push(budget);
		}
		return this.writeData();
	}
}

export default BudgetManager;