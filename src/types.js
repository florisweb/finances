import Color from './color';
import { AvailableColors } from './color';
import Date from './time';
import { newId } from './polyfill';
import Vector from './vector';
import TransactionManager from './data/transactionManager';
import BudgetManager from './data/budgetManager';
import AIManager from './data/AIManager';
import TagManager from './data/tagManager';
import StockManager from './data/stockManager';

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

	constructor(_params) {
		_params.deltaMoney 	= parseFloat(_params.deltaMoney);
		_params.balance 	= parseFloat(_params.balance);
		_params.typeCode 	= _params.typeCode ?? 0;
		
		let dateObj = new Date(_params.date);
		dateObj.setMilliseconds(0);
		if (isNaN(dateObj)) dateObj = new Date().setFromStr(_params.date);
		_params.date = dateObj;
		Object.assign(this, _params);
	}

	get id() {
		return this.date.getTime() + '|' + this.deltaMoney + '|' + this.ownIBAN + this.targetIBAN + this.description + this.balance + this.bankClassification;
	}
	get tag() {
		return TagManager.getById(this.typeCode);
	}
	get predictedTag() {
		return AIManager.predictTag(this);
	}


	update() {
		TransactionManager.add(this);
	}


	export() {
		return {
			date: this.date.toString(true), 
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

export class FundTransaction extends Transaction {
	static isFundTransaction(_transaction) {
		return _transaction.description.includes('kocht via Euronext Fund Services'); 
	}

	fund;
	sharePriceAtTimeOfTransaction;
	shares;

	constructor() {
		super(...arguments);
		this.fund = this.description.split('Participaties ')[1].split(' a EUR')[0];
		this.sharePriceAtTimeOfTransaction = parseFloat(this.description.split(' a EUR ')[1].split('. Valutadatum')[0].split(' ').join('.'));
		this.shares = -this.deltaMoney / this.sharePriceAtTimeOfTransaction;
	}
}
export class FundDividendTransaction extends Transaction {
	static isFundDividend(_transaction) {
		return _transaction.description.includes('Uitkering cash dividend'); 
	}
	constructor() {
		super(...arguments);
		this.fund = this.description.split("'Uitkering cash dividend ")[1].split(' van EUR')[0];
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
	get firstTransactionDate() {
		let transactions = this.transactions;
		let first = transactions[0];
		if (!first) return false;
		return new Date().setDateFromStr(first.date);
	}

	getTransactionsByMonth(_monthId) {
		return TransactionManager.getByMonthAndTag(_monthId, this.id);
	}

	getExpensesByMonth(_monthId) {
		let transactions = this.getTransactionsByMonth(_monthId);
		return -transactions.map(t => t.deltaMoney).reduce((a, b) => a + b, 0);
	}
	
	getAverageExpensesInLastXMonths(_months = 12, _onlyCountMonthsWithExpenses = true) {
		let firstDate = this.firstTransactionDate;
		if (!firstDate) return 0;
		let firstMonthId = new MonthIdentifier().setFromDate(firstDate);
		if (new MonthIdentifier().date.getTime() <= firstMonthId.date.getTime()) return 0;
		let curMonthId = new MonthIdentifier().setFromDate(new Date().moveMonth(-_months));
		if (curMonthId.date.getTime() < firstMonthId.date.getTime()) curMonthId.setFromDate(firstMonthId.date);

		let sum = 0;
		let addedMonths = 0;
		let maxDate = new Date();
		maxDate.setDate(0);
		while (curMonthId.date.getTime() < maxDate.getTime())
		{
			sum += this.getExpensesByMonth(curMonthId);
			curMonthId = new MonthIdentifier().setFromDate(curMonthId.date.moveMonth(1));
			addedMonths++;
		}

		if (_onlyCountMonthsWithExpenses) return sum / addedMonths;
		return sum / _months;
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
		return this.getSavingsAtEndOfMonth(new MonthIdentifier().setFromDate(new Date().moveMonth(-1)));
	}

	getSavingsAtEndOfMonth(_monthId) { // Budget is added at the end of the month
		let firstDayOfNextMonth = _monthId.date.moveMonth(1);
		
		let transactions = this.transactions;
		let totalExpensesUntilMonth = transactions.filter(
			(_t) => new Date().setFromStr(_t.date).getTime() < firstDayOfNextMonth.getTime()
		).map((_t) => _t.deltaMoney).reduce((a, b) => a + b, 0);

		let budgetedMoney = 0;
		for (let budget of BudgetManager._data)
		{
			if (budget.startMonthId.date.getTime() > _monthId.date.getTime()) continue; // Budget starts after the requested month
			let budgetPerMonth = budget.getBudgetForTag(this.id);
			budgetedMoney += budgetPerMonth * budget.getLengthInStartedMonthsOnDate(_monthId.date);
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
	get hasFinished() {
		let prevMonth = new Date();
		prevMonth.setDate(0);
		return !this.isActive && this.endMonthId && this.endMonthId.date.getTime() <= new MonthIdentifier().setFromDate(prevMonth).date.getTime();
	}

	get lengthInMonths() {
		return this.getLengthInStartedMonthsOnDate(new Date());
	}

	get averageExpenses() { // Excludes current month
		let lastFinishedMonthDate = new Date();
		lastFinishedMonthDate.setDate(0);
		
		let endMonthId = this.endMonthId || new MonthIdentifier().setFromDate(lastFinishedMonthDate);
		let curMonthId = this.startMonthId.copy();
		if (endMonthId.date.getTime() < curMonthId.date.getTime()) return Symbol('Budget not started yet');
		
		let sum = 0;
		let months = 0;
		while (curMonthId.date.getTime() <= endMonthId.date.getTime())
		{
			let transactions = TransactionManager.getByMonth(curMonthId);
			months += 1;
			sum += transactions.map(a => a.deltaMoney).reduce((a, b) => a + b, 0);
			curMonthId = new MonthIdentifier().setFromDate(curMonthId.date.moveMonth(1));
		}
		return sum / months;
	}

	getLengthInStartedMonthsOnDate(_date) { // MONTHS WHICH HAVE STARTED: so 2 december -> december
		let monthId = new MonthIdentifier().setFromDate(_date);
		if (this.endMonthId && this.endMonthId.date.getTime() < monthId.date.getTime())
		{
			return this.endMonthId.date.getDateInMonths() - this.startMonthId.date.getDateInMonths() + 1;	
		} 
		return monthId.date.getDateInMonths() - this.startMonthId.date.getDateInMonths() + 1;
	}


	get name() {
		if (typeof this.startMonthId !== 'object') return '<-' + (this.endMonthId ? ' - ' + this.endMonthId.name : ' - ->');
		return this.startMonthId.name + (this.endMonthId ? ' - ' + this.endMonthId.name : ' ->');
	}

	get shortName() {
		if (typeof this.startMonthId !== 'object') return '<-' + (this.endMonthId ? ' - ' + this.endMonthId.shortName : ' - ->');
		return this.startMonthId.shortName + (this.endMonthId ? ' - ' + this.endMonthId.shortName : ' ->');
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
		
	constructor({name, tagBudgetSets = []}) {
		this.name = name ?? 'No name';
		this.tagBudgetSets = tagBudgetSets.map((_set) => {
			if (_set instanceof TagBudgetSet) return _set;
			return new TagBudgetSet(_set);
		}) ?? [];
	}

	export() {
		return {
			name: this.name,
			tagBudgetSets: this.tagBudgetSets.map(set => set.export())
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

export class TagBudgetSet {
	tagId;
	budget = 0; // + = expenses, - = income
	contributions = [];


	constructor({tagId, budget, contributions}) {
		this.tagId = tagId;
		this.budget = budget;
		this.contributions = contributions || [];
	}
	
	export() {
		return {
			tagId: this.tagId,
			budget: this.budget,
			contributions: this.contributions
		}
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
	IBAN = '';
	name = '';
	
	get id() {return this.IBAN}

	get isFundAccount() {
		return !!this.transactions.find(a => a instanceof FundTransaction);
	}

	get type() {
		if (this.isFundAccount) return 'FUND';
		if (this.IBAN === 'Revolut') return 'REVOLUT';
		return 'ASN';
	}


	get transactions() {
		return TransactionManager.getByAccount(this);
	}

	getCashValue() {
		let transactions = this.transactions;
		transactions.sort((a, b) => a.date < b.date);
		if (transactions.length === 0) return 0;
		let lastTrans = transactions[0];
		return lastTrans.balance + lastTrans.deltaMoney;
	}
	
	async getBalance() {
		if (!this.isFundAccount) return this.getCashValue();
		return this.getCashValue() + await this.getFundValue();
	}

	getCashValueAtEndOfMonth(_monthId) {
		let transactions = this.transactions;
		if (!transactions.length) return 0;
		let lastTransactionInMonth = transactions[transactions.length - 1];
		for (let i = transactions.length - 1; i >= 0; i--)
		{
			if (!_monthId.containsDate(transactions[i].date)) continue;
			lastTransactionInMonth = transactions[i];
			break;
		}

		return lastTransactionInMonth.balance + lastTransactionInMonth.deltaMoney;
	}

	async getBalanceAtEndOfMonth(_monthId) {
		if (!this.isFundAccount) return this.getCashValueAtEndOfMonth(_monthId);
		return this.getCashValueAtEndOfMonth(_monthId) + await this.getFundValueAtEndOfMonth(_monthId);
	}

	async generateGraphData(_range = 11) {
		let balancePerMonth = [];

		let promises = [];
		for (let i = -_range - 1; i < 0; i++)
		{
			let curMonth = new MonthIdentifier().setFromDate(new Date().moveMonth(i))
			promises.push(
				this.getBalanceAtEndOfMonth(curMonth).then(
					balance => balancePerMonth.push(new Vector(curMonth.date.copy().moveMonth(1).getTime(), balance || 0))
				)
			);
		}
		await Promise.all(promises);
		balancePerMonth.sort((a, b) => a.value[0] > b.value[0]);
		return balancePerMonth;
	}

	constructor({IBAN, name}) {
		this.IBAN = IBAN;
		this.name = name;
	}

	clone() {
		return new BankAccount(this.export());
	}

	export() {
		return {
			name: this.name,
			IBAN: this.IBAN,
		}
	}

	// FUND PART
	getFunds() {
		return this.getFundsAtEndOfMonth(new MonthIdentifier());
	}
	async getFundValue() {
		return await this.getFundValueAtEndOfMonth(new MonthIdentifier());
	}

	async getFundsAtEndOfMonth(_monthId) {
		let fundNames = [];
		let transactions = this.transactions;
		for (let trans of transactions)
		{
			if (!(trans instanceof FundTransaction)) continue;
			if (trans.date.getTime() > _monthId.date.copy().moveMonth(1).getTime()) continue; // End of month, monthId gives date at beginning of month
			if (!fundNames.includes(trans.fund)) fundNames.push(trans.fund);
		}
		
		let funds = {};
		for (let fund of fundNames) funds[fund] = new Fund(this, fund);
		await Promise.all(Object.keys(funds).map(r => funds[r].lastUpdateTime));
		return funds;
	}

	async getFundValueAtEndOfMonth(_monthId) {
		let funds = await this.getFundsAtEndOfMonth(_monthId);
		let sum = 0;
		let promises = [];
		for (let fundName in funds) {
			promises.push(funds[fundName].getValueAtEndOfMonth(_monthId).then(a => sum += a));
		}
		await Promise.all(promises);
		return sum
	}
}

class Fund {
	account;
	name;
	value;
	lastUpdateTime = null;
	priceHistory = [];

	constructor(_account, _name) {
		this.account = _account;
		this.name = _name;

		this.lastUpdateTime = StockManager.fetchStockHistory(this.name).then((_results) => {
			if (_results.error) return;
			this.priceHistory = _results;
			this.lastUpdateTime = _results[0]?.time;
		});
		this.value = this.getValueAtEndOfMonth().then((result) => this.value = result);
	}
	

	get transactions() {
		let transactions = this.account.transactions;
		return transactions.filter(trans => trans instanceof FundTransaction && trans.fund === this.name);
	}
	get dividendTransactions() {
		let transactions = this.account.transactions;
		return transactions.filter(trans => trans instanceof FundDividendTransaction && trans.fund === this.name);
	}

	get shares() {
		return this.getSharesAtEndOfMonth(new MonthIdentifier());
	}
	get investment() {
		return this.getInvestmentAtEndOfMonth(new MonthIdentifier());
	}
	

	getTransactionsAtEndOfMonth(_monthId = new MonthIdentifier()) { // Transactions before end of month
		return this.transactions.filter(trans => trans.date.getTime() <= _monthId.date.copy().moveMonth(1).getTime());
	}
	getDividendTransactionsAtEndOfMonth(_monthId = new MonthIdentifier()) { // Transactions before end of month
		return this.dividendTransactions.filter(trans => trans.date.getTime() <= _monthId.date.copy().moveMonth(1).getTime());
	}
	getSharesAtEndOfMonth(_monthId) {
		return this.getTransactionsAtEndOfMonth(_monthId).map(r => r.shares).reduce((a, b) => a + b, 0);
	}
	getInvestmentAtEndOfMonth(_monthId) {
		let boughtShareWorth = -this.getTransactionsAtEndOfMonth(_monthId).map(r => r.deltaMoney).reduce((a, b) => a + b, 0);
		let dividendsWorth = this.getDividendTransactionsAtEndOfMonth(_monthId).map(r => r.deltaMoney).reduce((a, b) => a + b, 0);
		return boughtShareWorth - dividendsWorth;
	}

	async getValueAtEndOfMonth(_monthId = new MonthIdentifier()) {
		let shares = this.getSharesAtEndOfMonth(_monthId);
		return shares * (await this.getSharePriceAtEndOfMonth(_monthId));
	}

	async getSharePriceAtEndOfMonth(_monthId) {
		if (!(this.lastUpdateTime instanceof Date)) await this.lastUpdateTime;
		let preDate = _monthId.date.copy().moveMonth(1);
		let sortables = this.priceHistory.map((r, i) => {return {dt: Math.abs(r.time - preDate), index: i}});
		sortables.sort((a, b) => a.dt > b.dt);
		let closestIndex = sortables[0]?.index;
		return this.priceHistory[closestIndex].stockPrice;
	}
}



export class MonthIdentifier {
	#string;

	get name() {
		return this.date.getMonths()[this.date.getMonth()].name + ' ' + this.date.getFullYear();
	}
	get shortName() {
		return this.date.getMonths()[this.date.getMonth()].name.substr(0, 3) + ' ' + this.date.getFullYear();
	}

	constructor() {
		this.setFromDate(new Date());
	}

	copy() {
		return new MonthIdentifier().setFromId(this.id);
	}

	setFromId(_id) {
		this.#string = _id;
		return this;
	}
	setFromDate(_date) {
		if (!(_date instanceof Date)) _date = new Date().setDateFromStr(_date);
		this.#string = (_date.getMonth() + 1) + '/' + _date.getFullYear();
		return this;
	}
	setFromDateString(_dateString) {
		return this.setFromDate(new Date().setDateFromStr(_dateString));
	}

	containsDate(_date) {
		let date = new Date().setDateFromStr(typeof _date === 'string' ? _date : _date.toString());
		date.setHours(0);
		date.setMinutes(0);

		let ownDate = this.date;
		ownDate.setHours(0);
		ownDate.setMinutes(0);
		
		let endDate = this.date.copy().moveMonth(1);
		endDate.setHours(0);
		endDate.setMinutes(0);

		return ownDate.getTime() <= date.getTime() && endDate.getTime() >= date.getTime();
	}


	get date() {
		let parts = this.#string.split('/');
		let date = new Date();
		date.setFullYear(parseInt(parts[1]));
		date.setDate(1);
		date.setMonth(parseInt(parts[0]) - 1);
		date.setHours(0);
		date.setMinutes(0);
		date.setMilliseconds(0);
		return date;
	}

	get id() {
		return this.#string;
	}
}
window.MonthIdentifier = MonthIdentifier;