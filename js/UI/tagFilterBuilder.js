
class UITagFilterBuilder {
	#HTML = {};
	elements = [];

	constructor() {
		this.#HTML.self = createElement('div', 'UITagFilterBuilder');
		this.#HTML.self.innerHTML = `
			<div class='UIText'>Auto-classifier filter</div>
			<div class='statementHolder'></div>
		`;
		this.#HTML.statementHolder = this.#HTML.self.children[1];
	}


	setFilter(_ORStatements = []) {
		console.log(_ORStatements);
		this.#HTML.statementHolder.innerHTML = '';
		let ANDGroups = _ORStatements.map(group => new UITagFilterBuilder_ANDSet({statements: group}));
		console.log(ANDGroups);
		for (let ANDGroup of ANDGroups)
		{
			this.#HTML.statementHolder.append(ANDGroup.HTML);
		}
	}

	
	
	get HTML() {		
		return this.#HTML.self;
	}
}


class UITagFilterBuilder_ANDSet {
	#statements = [];
	#HTML = {}
	constructor({statements = []} = {statements: []}) {
		this.#statements = statements.map(s => new UITagFilterBuilder_rule({statement: s}));
		this.#HTML.self = createElement('div', 'UIFilter_ANDSet');
		for (let statement of this.#statements)
		{
			this.#HTML.self.append(statement.HTML);
		}
	}
	get HTML() {
		return this.#HTML.self;
	}
}

class UITagFilterBuilder_rule {
	#statement = [];
	#HTML = {}
	constructor({statement}) {
		this.#statement = statement;

		this.#HTML.self = createElement('div', 'UIFilterRule');
		this.#HTML.targetSelector = new DropDown();
		this.#HTML.targetSelector.addOption({contentHTML: 'Description', value: 'description'});
		this.#HTML.targetSelector.addOption({contentHTML: 'Target Name', value: 'targetName'});
		this.#HTML.targetSelector.addOption({contentHTML: 'Bank Classification', value: 'bankClassification'});
		this.#HTML.targetSelector.selectOption(statement[0]);

		this.#HTML.comperatorSelector = new DropDown();
		this.#HTML.comperatorSelector.addOption({contentHTML: 'Equals', value: '=='});
		this.#HTML.comperatorSelector.addOption({contentHTML: 'Includes', value: 'includes'});
		this.#HTML.comperatorSelector.addOption({contentHTML: 'Is bigger than', value: '>'});
		this.#HTML.comperatorSelector.addOption({contentHTML: 'Is smaller than', value: '<'});
		this.#HTML.comperatorSelector.selectOption(statement[1]);

		this.#HTML.valueInput = new UIInput();
		this.#HTML.valueInput.value = statement[2];

		this.#HTML.self.append(this.#HTML.targetSelector.HTML);
		this.#HTML.self.append(this.#HTML.comperatorSelector.HTML);
		this.#HTML.self.append(this.#HTML.valueInput.HTML);
	}


	get HTML() {
		return this.#HTML.self;
	}
}