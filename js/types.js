
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

class TransactionType {
	name;
	color;
	id;
	constructor({name, color, id}) {
		this.name = name;
		this.color = color;
		this.id = id;
	}
}
