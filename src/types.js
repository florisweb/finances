import Color from './color';
import { AvailableColors } from './color';
import Date from './time';
import { newId } from './polyfill';
import TransactionManager from './data/transactionManager';
import BudgetManager from './data/budgetManager';
import AccountManager from './data/accountManager';

export class Transaction {
	date;
	typeCode = 0;
	ownIBAN = '';
	targetIBAN = '';
	targetName = '';
	deltaMoney;
	description = '';
	balance = 0;
	bankClassification = '';
	classificationState = 0; // 0: not classified, 1: autoclassified, 2: manually classified

	get isInternalTransfer() {
		return !!AccountManager.getByIBAN(this.targetIBAN);
	}
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
			ownIBAN: this.ownIBAN || 'NO-IBAN',
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
	filter;

	constructor({name, color, id, filter}) {
		this.name = name;
		this.color = typeof color === 'string' ? new Color(color) : color;
		this.id = id ?? newId();
		this.filter = new TagFilter(filter);
	}

	transactionFitsTag(_transaction) {
		if (!this.filter) return false;
		return this.filter.evaluate(_transaction);
	}

	getBudgetInMonth(_monthId) {
		let budget = BudgetManager.getByMonth(_monthId);
		if (!budget) return false;
		return budget.getBudgetForTag(this.id);
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
	}

	getExpensesByMonth(_monthId) {
		let transactions = this.getTransactionsByMonth(_monthId);
		return transactions.map(t => t.deltaMoney).reduce((a, b) => a + b, 0);
	}

	get averageExpensesLast12Months() {
		let sum = 0;
		let curMonthId = new MonthIdentifier();
		for (let i = 0; i < 12; i++)
		{
			curMonthId = new MonthIdentifier().setFromDate(curMonthId.date.moveMonth(-1));
			sum += this.getExpensesByMonth(curMonthId);
		}
		return sum / 12;
	}

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
			filter: this.filter.export(),
		}
	}

	clone() {
		return new TransactionTag(this.export());
	}
}

export class SavingsTransactionTag extends TransactionTag {
	isSavingsTag = true;
	startValue = 0;

	constructor({name, color, id, filter, startValue = 0}) {
		super(...arguments);
		this.startValue = startValue;
	}

	get totalSavings() {
		let budgetedMoney = 0;
		for (let budget of BudgetManager._data)
		{
			let budgetPerMonth = budget.getBudgetForTag(this.id);
			budgetedMoney += budgetPerMonth * budget.lengthInMonths;
		}

		return this.startValue + this.totalExpenses - budgetedMoney;
	}

	getSavingsAtStartOfMonth(_monthId) { // Budget is added at the end of the month
		let transactions = this.transactions;
		let totalExpensesUntilMonth = transactions.filter(
			(_t) => new Date().setFromStr(_t.date).getTime() < _monthId.date.getTime()
		).map((_t) => _t.deltaMoney).reduce((a, b) => a + b, 0);

		let budgetedMoney = 0;
		for (let budget of BudgetManager._data)
		{
			if (budget.startMonthId.date.getTime() > _monthId.date.getTime()) continue;
			let lengthInMonths = budget.lengthInMonths;
			if (!budget.endMonthId || budget.endMonthId.date.getTime() > _monthId.date.getTime())
			{
				lengthInMonths = _monthId.date.getDateInMonths() - budget.startMonthId.date.getDateInMonths();
			}

			let budgetPerMonth = budget.getBudgetForTag(this.id);
			budgetedMoney += budgetPerMonth * lengthInMonths;
		}
		return this.startValue + totalExpensesUntilMonth - budgetedMoney;
	}

	export() {
		let data = super.export();
		data.isSavingsTag = true;
		data.startValue = this.startValue;
		return data;
	}
	clone() {
		return new SavingsTransactionTag(this.export());
	}
}


export class NonAssignedTag extends TransactionTag {
	isNonAssignedTag = true;
	constructor() {
		super({name: "Non Assigned", color: AvailableColors[0].color, id: 0, startValue: 0});
	}
}














export class Budget {
	id;
	startMonthId;
	endMonthId = false; // False if still running / doesn't have an end date
	sections = [];

	get isActive() {
		if (this.startMonthId.date.getTime() > new Date().getTime()) return false;
		if (!this.endMonthId) return true;
		let endOfMonthDate = this.endMonthId.date.moveMonth(1);
		endOfMonthDate.setDate(0);
		endOfMonthDate.setHours(24);
		endOfMonthDate.setMinutes(0);
		return endOfMonthDate.getTime() >= new Date().getTime();
	}
	get lengthInMonths() {
		let prevMonthDate = new Date(); 
		prevMonthDate.setDate(-1);
		let endDate = prevMonthDate;
		if (this.endMonthId && this.endMonthId.date.getTime() < prevMonthDate.getTime()) endDate = this.endMonthId.date;

		return endDate.getDateInMonths() - this.startMonthId.date.getDateInMonths() + 1;
	}

	get name() {
		if (typeof this.startMonthId !== 'object') return '<-' + (this.endMonthId ? ' - ' + this.endMonthId.name : ' - ->');
		return this.startMonthId.name + (this.endMonthId ? ' - ' + this.endMonthId.name : ' ->');
	}




	constructor({id, startMonthId, endMonthId, sections}) {
		this.id = id ?? newId();
		this.startMonthId = typeof startMonthId === 'string' ? new MonthIdentifier().setFromId(startMonthId) : startMonthId;
		this.endMonthId = typeof endMonthId === 'string' ? new MonthIdentifier().setFromId(endMonthId) : endMonthId ?? false;

		this.sections = sections?.map((_section) => {
			if (_section instanceof BudgetSection) return _section;
			return new BudgetSection(_section);
		}) || [];
	}

	clone() {
		return new Budget(this.export());
	}

	export() {
		return {
			id: this.id,
			startMonthId: this.startMonthId.id,
			endMonthId: this.endMonthId?.id,
			sections: this.sections.map(s => s.export())
		}
	}

	getBudgetForTag(_tagId) {
		return this.sections.map((_sec) => _sec.getTagBudgetById(_tagId)).reduce((a, b) => a + b, 0)
	}
	get sum() {
		return this.sections.map((_section) => _section.sum).reduce((a, b) => a + b, 0);
	}
}


export class BudgetSection {
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
			tagBudgetSets: Object.assign([], this.tagBudgetSets)
		}
	}

	get sum() {
		return this.tagBudgetSets.map((set) => set.budget).reduce((a, b) => a + b, 0);
	}

	getTagBudgetById(_tagId) {
		let set = this.tagBudgetSets.find((_set) => _set.tagId === _tagId);
		if (!set) return 0;
		return set.budget;
	}
}







/* TagFilter
	[
		a,
		OR
		b
		OR
		c,
	]

	a = [
		x AND y
	]
	x = Property action comperator
	Property = description | targetName | bankClassification
	action = == | < | > | contains
*/

export class TagFilter {
	value = [];

	constructor(_filter = []) {
		this.value = _filter;
	}

	evaluate(_transaction) {
		for (let ORStatement of this.value) 
		{
			let foundWrongStatement = false;
			for (let ANDStatement of ORStatement)
			{
				if (foundWrongStatement) break;

				let targetType 	= ANDStatement[0];
				let comperator 	= ANDStatement[1];
				let comparee 	= ANDStatement[2].toLowerCase();
				let target = '';
				switch (targetType)
				{
					case "targetName": target = _transaction.targetName; break;
					case "description": target = _transaction.description; break;
					case "bankClassification": target = _transaction.bankClassification; break;
					default: foundWrongStatement = true; break;
				}

				if (!target) {foundWrongStatement = true; break}
				target = target.toLowerCase(); 

				switch (comperator)
				{
					case "includes": 
						foundWrongStatement = !target.includes(comparee);
					break;

					case "==": 
						foundWrongStatement = !(target == comparee);
					break;
					case ">":
						foundWrongStatement = !(target > comparee);
					break;
					case "<": 
						foundWrongStatement = !(target < comparee);
					break;
					default: foundWrongStatement = true; break;
				}
			}

			if (!foundWrongStatement) return true;
		}
		return false;

	}

	export() {
		return Object.assign([], this.value);
	}
}
					
			









export class BankAccount {
	name = '';
	IBAN = '';
	get transactions() {

	}

	constructor({IBAN, name}) {
		this.IBAN = IBAN;
		this.name = name;
	}

	export() {
		return {
			name: this.name,
			IBAN: this.IBAN,
		}
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