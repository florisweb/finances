
class Transaction {
	date;
	typeCode;
	targetIBAN = '';
	targetName = '';
	deltaMoney;
	description = '';
	constructor(_params) {
		_params.deltaMoney = parseFloat(_params.deltaMoney);
		Object.assign(this, _params);
	}

	get identifier() {
		return this.date + this.deltaMoney + this.targetIBAN + this.description;
	}


	export() {
		return {
			date: this.date, 
			typeCode: this.typeCode, 
			targetIBAN: this.targetIBAN,
			targetName: this.targetName,
			deltaMoney: this.deltaMoney,
			description: this.description
		}
	}
}



class TransactionTag {
	name;
	color;
	id;
	expensesBudget = {}; 

	#filter;
	constructor({name, color, id, filter, expensesBudget = {}}) {
		this.name = name;
		this.color = typeof color === 'string' ? new Color(color) : color;
		this.id = id;
		this.expensesBudget = expensesBudget;
		this.#filter = new TagFilter(filter);
	}

	render() {
		let element = createElement('div', 'tag');
		element.append(this.renderIndicator());
		let titleHolder = createElement('div', 'tagNameHolder');
		setTextToElement(titleHolder, this.name);
		element.append(titleHolder);
		
		return element;
	}
	renderIndicator() {
		let indicator = createElement('div', 'tagIndicator');
		indicator.style.background = this.color.copy().merge(new Color('rgba(255, 255, 255, 0)'), .4).RGBA;
		indicator.style.borderColor = this.color.hex;
		return indicator;
	}

	transactionFitsTag(_transaction) {
		if (!this.#filter) return false;
		return this.#filter.evaluate(_transaction);
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


	get transactions() {
		return TransactionManager.getByTag(this.id);
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
			filter: this.#filter.export(),
			expensesBudget: this.expensesBudget,
		}
	}
}



/*
	Total balance on bank account
	= sum savingsTags = sum all transactions = sum subset of transactions + c (c calculatable if asking total account balance)


	tag:
	per month:
	- i Actual income							50
	- e Actual expenses 						150
	paymentDeficit = income - expenses 			= -100
	
	- b budget 									= 120

	budgetDeficit: budget - paymentDeficit		= 120 - 100 = 20 -> 20 euro's left over
	|- isSavingsTag => budgetDeficit optellen = savings
	\- else: deficit to Unassigned



	Default Tag: Unassigned - not budgetable


	
	

	

	BudgetPage: sum MUST be 0: -> rest goes into rest tag


*/


class SavingsTransactionTag extends TransactionTag {
	isSavingsTag = true;
	startValue = 0;

	constructor({name, color, id, filter, expensesBudget, startValue = 0}) {
		super({name: name, color: color, id: id, filter: filter, expensesBudget: expensesBudget});
		this.startValue = startValue;
	}

	get totalSavings() {


	}

	export() {
		let data = super.export();
		data.isSavingsTag = true;
		data.startValue = this.startValue;
		return data;
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
	Property = description | targetName
	action = == | < | > | contains
*/

class TagFilter {
	#filter = [];
	constructor(_filter = []) {
		this.#filter = _filter;
	}


	evaluate(_transaction) {
		for (let ORStatement of this.#filter) 
		{
			let foundWrongStatement = false;
			for (let ANDStatement of ORStatement)
			{
				if (foundWrongStatement) break;

				let targetType 	= ANDStatement[0];
				let comperator 	= ANDStatement[1];
				let comparee 	= ANDStatement[2];
				let target = '';
				switch (targetType)
				{
					case "targetName": target = _transaction.targetName; break;
					case "description": target = _transaction.description; break;
					default: foundWrongStatement = true; break;
				}

				if (!target) {foundWrongStatement = true; break}

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
		return this.#filter;
	}
}
					
					









class MonthIdentifier {
	#string;

	setFromId(_id) {
		this.#string = _id;
		return this;
	}
	setFromDate(_date) {
		this.#string = _date.getMonth() + '/' + _date.getFullYear();
		return this;
	}
	setFromDateString(_dateString) {
		return this.setFromDate(new Date().setDateFromStr(_dateString));
	}


	get date() {
		let parts = this.#string.split('/');
		let date = new Date();
		date.setMonth(parseInt(parts[0]));
		date.setFullYear(parseInt(parts[1]));
		return date;
	}

	get id() {
		return this.#string;
	}
}