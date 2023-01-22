
class Transaction {
	date;
	typeCode;
	targetIBAN = '';
	targetName = '';
	deltaMoney;
	description = '';
	constructor(_params) {
		Object.assign(this, _params);
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
		element.innerHTML = `
			<div class='tagIndicator'></div>
			<div class='tagNameHolder'></div>
		`;
		element.children[0].style.background = this.color.copy().merge(new Color('rgba(255, 255, 255, 0)'), .4).RGBA;
		element.children[0].style.borderColor = this.color.hex;

		setTextToElement(element.children[1], this.name);
		return element;
	}

	transactionFitsTag(_transaction) {
		if (typeof this.#filter !== 'function') return false;
		try {
			return this.#filter(_transaction);
		} catch (e) {return false}
	}
}