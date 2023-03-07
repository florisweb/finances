
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
		this.color = typeof color === 'string' ? new Color(color) : color;
		this.id = id;
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

	get transactions() {
		return TransactionManager.getByTag(this.id);
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
			filter: this.#filter.export()
		}
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

	export() {
		let data = super.export();
		data.isSavingsTag = true;
		data.startValue = this.#startValue;
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
					
					







