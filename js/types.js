
class Transaction {
	date;
	typeCode;
	targetIBAN;
	targetName;
	deltaMoney;
	description;
	constructor(_params) {
		Object.assign(this, _params);
	}
}

class TransactionTag {
	name;
	color;
	id;
	constructor({name, color, id}) {
		this.name = name;
		this.color = color;
		this.id = id;
	}

	render() {
		let element = createElement('div', 'tag');
		element.innerHTML = `
			<div class='tagIndicator'></div>
			<div class='tagNameHolder'></div>
		`;
		element.children[0].style.background = this.color.copy().merge(new Color('rgba(255, 255, 255, 0)'), .2).RGBA;
		element.children[0].style.borderColor = this.color.hex;

		setTextToElement(element.children[1], this.name);
		return element;
	}
}