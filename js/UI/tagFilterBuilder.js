
class UITagFilterBuilder {
	#HTML = {};
	_ANDGroups;

	get HTML() {		
		return this.#HTML.self;
	}

	get value() {
		return this._ANDGroups.map(s => s.statements);
	}
	constructor() {
		this.#HTML.self = createElement('div', 'UITagFilterBuilder');
		this.#HTML.self.innerHTML = `
			<div class='UIText'>Transaction-classifier filter</div>
			<div class='statementHolder'></div>
		`;
		this.#HTML.statementHolder = this.#HTML.self.children[1];
	}


	setFilter(_filter = []) {
		if (_filter instanceof TagFilter) _filter = _filter.value;
		this.#HTML.statementHolder.innerHTML = '';
		this._ANDGroups = _filter.map(group => new UITagFilterBuilder_ANDSet({statements: group}, this));
		this.updateHTML();
	}
	


	_removeGroupById(_id) {
		let index = this._ANDGroups.findIndex((a) => a.id === _id);
		if (index === -1) return false;
		this._ANDGroups.splice(index, 1);
	}

	updateHTML() {
		this.#HTML.statementHolder.innerHTML = '';
		for (let set of this._ANDGroups)
		{
			this.#HTML.statementHolder.append(set.HTML);
		}
		let addANDSetButton = new UIButton({text: '+ Add Rule Set', onclick: () => this.#addANDSetAtEnd()});
		this.#HTML.statementHolder.append(addANDSetButton.HTML);
	}

	#addANDSetAtEnd() {
		let newSet = new UITagFilterBuilder_ANDSet({statements: [[0, 0, null]]}, this);
		this._ANDGroups.push(newSet);
		this.updateHTML();
	}

}


class UITagFilterBuilder_ANDSet {
	_statements = [];
	#HTML = {};
	#parent;
	id = newId();

	constructor({statements = []} = {statements: []}, _parent) {
		this.#parent = _parent;
		this._statements = statements.map(s => new UITagFilterBuilder_rule({statement: s}, this));
		this.#HTML.self = createElement('div', 'UIFilter_ANDSet');
		this.updateHTML();
	}
	get HTML() {
		return this.#HTML.self;
	}

	get statements() {
		return this._statements.map(s => s.statement);
	}


	_removeStatementById(_id) {
		let index = this._statements.findIndex((a) => a.id === _id);
		if (index === -1) return false;
		this._statements.splice(index, 1);
		if (this._statements.length === 0) this.remove();
	}

	remove() {
		this.#HTML.self.classList.add('removeAnimation');
		setTimeout(() => this.#HTML.self.parentNode.removeChild(this.#HTML.self), 300);
		this.#parent._removeGroupById(this.id);
	}

	updateHTML() {
		this.#HTML.self.innerHTML = '';
		for (let statement of this._statements)
		{
			this.#HTML.self.append(statement.HTML);
		}
	}
}



class UITagFilterBuilder_rule {
	id = newId();
	#statement = [];
	#HTML = {};
	#parent;
	constructor({statement}, _parent) {
		this.#parent = _parent;
		this.#HTML.self = createElement('div', 'UIFilterRule');

		this.#HTML.self.classList.add('removeAnimation');
		setTimeout(() => this.#HTML.self.classList.remove('removeAnimation'), 10);

		this.#HTML.self.addEventListener('click', (e) => {
			if (!e.target.classList.contains('UIFilterRule')) return;
			this.#addRuleAfter();
		});


		this.#HTML.targetSelector = new DropDown();
		this.#HTML.targetSelector.addOption({contentHTML: 'Description', value: 'description'});
		this.#HTML.targetSelector.addOption({contentHTML: 'Target Name', value: 'targetName'});
		this.#HTML.targetSelector.addOption({contentHTML: 'Bank Classification', value: 'bankClassification'});
		

		this.#HTML.comperatorSelector = new DropDown();
		this.#HTML.comperatorSelector.addOption({contentHTML: 'Equals', value: '=='});
		this.#HTML.comperatorSelector.addOption({contentHTML: 'Includes', value: 'includes'});
		this.#HTML.comperatorSelector.addOption({contentHTML: 'Is bigger than', value: '>'});
		this.#HTML.comperatorSelector.addOption({contentHTML: 'Is smaller than', value: '<'});
		
		this.#HTML.valueInput = new UIInput({placeholder: 'Value'});

		this.#HTML.self.append(this.#HTML.targetSelector.HTML);
		this.#HTML.self.append(this.#HTML.comperatorSelector.HTML);
		this.#HTML.self.append(this.#HTML.valueInput.HTML);

		let removeButton = new UIButton({text: 'X', onclick: () => this.remove(), filled: true, customClass: 'removeButton'});
		this.#HTML.self.append(removeButton.HTML);

		this.statement = statement;
	}

	set statement(_statement = []) {
		this.#statement = _statement;
		this.#HTML.targetSelector.selectOption(this.#statement[0]);
		this.#HTML.comperatorSelector.selectOption(this.#statement[1]);
		this.#HTML.valueInput.value = this.#statement[2];
	}

	get statement() {
		return [this.#HTML.targetSelector.value, this.#HTML.comperatorSelector.value, this.#HTML.valueInput.value];
	}


	#addRuleAfter() {
		let newRule = new UITagFilterBuilder_rule({statement: [0, 0, null]}, this.#parent);
		this.#parent._statements.push(newRule);
		this.#parent.updateHTML();
	}


	remove() {
		this.#HTML.self.classList.add('removeAnimation');
		setTimeout(() => this.#HTML.self.parentNode.removeChild(this.#HTML.self), 300);
		this.#parent._removeStatementById(this.id);
	}

	get HTML() {
		console.log(this.#HTML.self);
		return this.#HTML.self;
	}
}