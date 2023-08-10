import Color from './color';
import { AvailableColors } from './color';
import Date from './time';
import TransactionManager from './data/transactionManager';
import { newId } from './polyfill';

export class Transaction {
	date;
	typeCode = 0;
	targetIBAN = '';
	targetName = '';
	deltaMoney;
	description = '';
	balance = 0;
	bankClassification = '';
	classificationState = 0; // 0: not classified, 1: autoclassified, 2: manually classified

	constructor(_params) {
		_params.deltaMoney 	= parseFloat(_params.deltaMoney);
		_params.balance 	= parseFloat(_params.balance);
		_params.typeCode 	= _params.typeCode ?? 0;
		Object.assign(this, _params);
	}

	get id() {
		return this.date + this.deltaMoney + this.targetIBAN + this.description;
	}

	update() {
		TransactionManager.add(this);
	}


	export() {
		return {
			date: this.date, 
			typeCode: this.typeCode, 
			targetIBAN: this.targetIBAN,
			targetName: this.targetName,
			deltaMoney: this.deltaMoney,
			description: this.description,
			balance: this.balance,
			bankClassification: this.bankClassification,
			classificationState: this.classificationState
		}
	}
}



export class TransactionTag {
	name;
	color;
	id;
	expensesBudget = {}; 

	// filter;
	constructor({name, color, id, filter, expensesBudget = {}}) {
		this.name = name;
		this.color = typeof color === 'string' ? new Color(color) : color;
		this.id = id ?? newId();
		// this.expensesBudget = expensesBudget;
		// this.filter = new TagFilter(filter);
	}

	transactionFitsTag(_transaction) {
		if (!this.filter) return false;
		return this.filter.evaluate(_transaction);
	}

	
	setExpensesBudget(_budget) {
		let curMonthCode = new MonthIdentifier().setFromDate(new Date()).id;
		this.expensesBudget[curMonthCode] = _budget;
	}

	get currentExpensesBudget() {
		let months = Object.keys(this.expensesBudget);
		let lastDate = new Date();
		lastDate.setYear(1970);
		let curBudget = 0;
		for (let monthPair of months)
		{
			let date = new MonthIdentifier().setFromId(monthPair).date;
			if (date.getTime() < lastDate.getTime()) continue;
			lastDate = date;
			curBudget = this.expensesBudget[monthPair];
		}
		return curBudget;
	}

	get averageExpenses() {
		let transactions = this.transactions;
		let curMonth = new MonthIdentifier().setFromDate(new Date());
		let startMonth = curMonth.date.moveMonth(-3);
		curMonth = curMonth.date;

		return -transactions.filter((t) => {
			let date = new Date().setFromStr(t.date);
			return date.getTime() > startMonth.getTime() && date.getTime() < curMonth.getTime();
		}).map(t => t.deltaMoney).reduce((a, b) => a + b, 0) / 3;
	}


	get transactions() {
		return TransactionManager.getByTag(this.id);
	}

	getTransactionsByMonth(_monthId) {
		return TransactionManager.getByMonthAndTag(_monthId, this.id);

		let found = [];
		for (let transaction of this.transactions)
		{
			if (!_monthId.containsDate(transaction.date)) continue;
			found.push(transaction);
		}
		return found;
	}



	getPaymentDeficits() {
		let months = {};

		let transactions = this.transactions;
		for (let transaction of transactions)
		{
			let curMonthCode = new MonthIdentifier().setFromDateString(transaction.date).id;
			if (!months[curMonthCode]) months[curMonthCode] = 0;
			months[curMonthCode] += transaction.deltaMoney;
		}
		return months;
	}

	// getBudgetDeficits() {
	// 	let paymentDefs = this.getPaymentDeficits();




	// }

	// getBudgetByMonthId(_id) {
	// 	if (this.#expensesBudget[_id] !== undefined) return this.#expensesBudget[_id];



	// }


	get totalExpenses() {
		let sum = 0;
		let transactions = this.transactions;
		for (let transaction of transactions) sum += transaction.deltaMoney;
		return sum;
	}

	export() {
		return {
			name: this.name,
			color: this.color.hex,
			id: this.id,
			// filter: this.filter.export(),
			// expensesBudget: this.expensesBudget,
		}
	}
}

export class SavingsTransactionTag extends TransactionTag {
	isSavingsTag = true;
	startValue = 0;

	constructor({name, color, id, filter, expensesBudget, startValue = 0}) {
		super(...arguments);
		this.startValue = startValue;
	}

	get totalSavings() {
		return 0;
		// let budgetedMoney = new ExpensesBudgetInterface(this.expensesBudget).totalBudget;;
		// return this.startValue + this.totalExpenses - budgetedMoney;
	}

	export() {
		let data = super.export();
		data.isSavingsTag = true;
		data.startValue = this.startValue;
		return data;
	}
}


export class NonAssignedTag extends TransactionTag {
	isNonAssignedTag = true;
	constructor() {
		super({name: "Non Assigned", color: AvailableColors[0].color, id: 0, expensesBudget: {}, startValue: 0});
	}
}









export class MonthIdentifier {
	#string;

	get name() {
		return this.date.getMonths()[this.date.getMonth()].name + ' ' + this.date.getFullYear();
	}

	constructor() {
		this.setFromDate(new Date());
	}

	setFromId(_id) {
		this.#string = _id;
		return this;
	}
	setFromDate(_date) {
		this.#string = (_date.getMonth() + 1) + '/' + _date.getFullYear();
		return this;
	}
	setFromDateString(_dateString) {
		return this.setFromDate(new Date().setDateFromStr(_dateString));
	}

	containsDate(_date) {
		let date = new Date().setDateFromStr(_date.toString())
		let ownDate = this.date;
		return date.dateIsBetween(ownDate, ownDate.copy().moveMonth(1));
	}


	get date() {
		let parts = this.#string.split('/');
		let date = new Date();
		date.setFullYear(parseInt(parts[1]));
		date.setMonth(parseInt(parts[0]) - 1);
		date.setDate(1);
		return date;
	}

	get id() {
		return this.#string;
	}
}
window.MonthIdentifier = MonthIdentifier;





export class Budget {
	id;
	startMonthId;
	endMonthId = false; // False if still running
	sections = [];

	constructor({id, startMonthId, endMonthId, sections}) {
		this.id = id ?? newId();
		this.startMonthId = startMonthId;
		this.endMonthId = endMonthId ?? false;

		this.sections = sections?.map((_section) => {
			if (_section instanceof BudgetSection) return _section;
			return new BudgetSection(_section);
		}) || [];
	}

	export() {
		return {
			startMonthId: this.startMonthId.id,
			endMonthId: this.endMonthId?.id,
			sections: this.sections.map(s => s.export())
		}
	}
}

// start = new MonthIdentifier()
// budget = new Budget({
// 	startMonthId: start, 
// 	sections: [{
// 		name: 'default', 
// 		tagBudgetSets: [
// 			{tagId: '786165905165', budget: 15}
// 		]
// 	}]
// })

class BudgetSection {
	name = '';
	tagBudgetSets = [];
	// { 
	//	tagId:
	//	budget: (+ = expenses, - = income)
	// }	

	constructor({name, tagBudgetSets = []}) {
		this.name = name ?? 'No name';
		this.tagBudgetSets = tagBudgetSets ?? [];
	}

	export() {
		return {
			name: this.name,
			tagBudgetSets: this.tagBudgetSets
		}
	}
}