










new class BudgetManagementPage extends Page {
	HTML = {};
	table;

	#budgetDeficit = 0;
	set budgetDeficit(_x) {
		this.#budgetDeficit = _x;
		if (!this.HTML.budgetSumHolder) return;
		setTextToElement(this.HTML.budgetSumHolder, formatMoneyString(this.#budgetDeficit));
	}
	get budgetDeficit() {
		return this.#budgetDeficit;
	}

	constructor() {
		super({pageIndex: 6});
		this.table = new UITable({keys: ['Tag', 'Is Expense', 'Budget', 'Savings']})
		this.pageHTML.append(this.table.HTML);
	}

	open() {
		super.open();
		this.render();
		this.updateBudgetDeficit();
	}


	render() {
		this.table.clear();
		for (let tag of TagManager.data)
		{
			let budgetTag = new BudgetPageTag(tag);
			this.table.addRow(budgetTag.renderRow());
		}

		this.HTML.budgetSumHolder = createElement('div', 'budgetSumHolder');

		let sumRow = new UITableRow({
			valueElements: [
				'Total:',
				'',
				this.HTML.budgetSumHolder,
			]
		})

		this.table.addRow(sumRow);


		
		// let tagItem = new AddManagementPageTag();
		// let html = tagItem.render();
		// html.style.animationDelay = (items * .01) + 's';
		// this.HTML.tagListHolder.append(html);
	}

	updateBudgetDeficit() {
		this.budgetDeficit = TagManager.data.map(tag => tag.currentExpensesBudget).reduce((a, b) => a + b);
	}
}


class BudgetPageTag extends TransactionTag {
	#HTML = {};
	isSavingsTag = false;
	constructor({name, color, id, filter, expensesBudget, startValue = 0, isSavingsTag}) {
		super({name: name, color: color, id: id, filter: filter, expensesBudget: expensesBudget, startValue: startValue});
		this.isSavingsTag = isSavingsTag;
	}

	onMoneyInputFieldInput(_value) {
		this.#updateMoneyInputFieldValue(_value);
		this.#updateTagBudget();
	}

	#updateMoneyInputFieldValue(_value) {
		let parts = String(_value).replace(/[^0-9.,]/g, '').replace(',', '.').split('.').splice(0, 2);
		let string = parts[0];
		if (parts.length === 1) return this.#HTML.moneyInputField.value = string;
		this.#HTML.moneyInputField.value = string + '.' + parts[1].substr(0, 2);
	}

	#updateTagBudget() {
		let expensesBudget = parseFloat(this.#HTML.moneyInputField.value);
		if (this.#HTML.isExpenseCheckbox.checked) expensesBudget *= -1;
		if (isNaN(expensesBudget)) expensesBudget = 0;
		this.setExpensesBudget(expensesBudget);
		TagManager.writeData();
		App.budgetManagementPage.updateBudgetDeficit();
	}


	renderRow() {
		this.#HTML.isExpenseCheckbox = new UICheckbox({text: '', onChange: () => this.#updateTagBudget()});
		this.#HTML.moneyInputField = new UIInput({placeholder: '-', onInput: (_value) => this.onMoneyInputFieldInput(_value)});

		this.#HTML.isExpenseCheckbox.checked = this.currentExpensesBudget <= 0;
		this.#updateMoneyInputFieldValue(this.currentExpensesBudget);


		return new UITableRow({
			valueElements: [
				this.render(),
				this.#HTML.isExpenseCheckbox.HTML,
				this.#HTML.moneyInputField.HTML,
				'-'
			]
		})

	}
}



