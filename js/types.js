
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
	#filter;
	constructor({name, color, id, filter}) {
		this.name = name;
		this.color = color;
		this.id = id;
		this.#filter = filter;
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
		if (typeof this.#filter !== 'function') return false;
		try {
			return this.#filter(_transaction);
		} catch (e) {return false}
	}

	get transactions() {
		return DataManager.getByTag(this.id);
	}

	get totalExpenses() {
		let sum = 0;
		let transactions = this.transactions;
		for (let transaction of transactions) sum += transaction.deltaMoney;
		return sum;
	}

}


class SavingsTransactionTag extends TransactionTag {
	isSavingsTag = true;
	#startValue = 0;
	get startValue() {
		return this.#startValue;
	}
	constructor({name, color, id, filter, startValue = 0}) {
		super({name: name, color: color, id: id, filter: filter});
		this.#startValue = startValue;
	}
}





