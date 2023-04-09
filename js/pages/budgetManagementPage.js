









class BudgetManagementPage_manageBudgetPopup extends Popup {
	#openPromiseResolver;
	#HTML = {};
	#curExpensesBudget = {};
	#earliestMonth = new Date();
	

	constructor() {
		let titleHolder = new UITitle({title: 'Manage Budget'});
		let table = new UITable({keys: ['Date', 'Budget'], customClass: 'budgetTable'});
		super({
			content: [
				titleHolder,
				new UIVerticalSpacer({height: 10}),
				table,

				new UIHorizontalSegment({content: [
					new UIButton({text: 'Save', customClass: 'alignRight', filled: true,  onclick: () => this.save()}),
					new UIButton({text: 'Cancel', customClass: 'alignRight', onclick: () => this.close()})
				]})
			],
			customClass: "manageBudgetPopup"
		})
		
		this.#HTML.titleHolder = titleHolder;
		this.#HTML.table = table;


		this.#HTML.table.HTML.addEventListener('scroll', (e) => {
			let top = this.#HTML.table.HTML.scrollHeight - this.#HTML.table.HTML.scrollTop - this.#HTML.table.HTML.offsetHeight;
			if (top > 150) return;
			this.#addRowAtEnd(this.#curExpensesBudget);
		});
	}


	open(_tag) {
		this.#curExpensesBudget = Object.assign({}, _tag.expensesBudget);
		this.#HTML.titleHolder.setTitle('Manage ' + _tag.name + '\'s budget');
		this.updateTableContent(this.#curExpensesBudget);

		super.open();
		return new Promise((resolver) => this.#openPromiseResolver = resolver);
	}

	save() {
		this.#openPromiseResolver(this.#curExpensesBudget);
		this.close();
	}



	updateTableContent(_expensesBudget) {
		this.#HTML.table.clear();
		
		let monthKeys = Object.keys(_expensesBudget).map((_month) => new MonthIdentifier().setFromId(_month));
		monthKeys.sort((a, b) => a.date.getTime() > b.date.getTime());

		if (!monthKeys[0]) return;
		
		let curMonth = monthKeys[0].date.moveMonth(-1 - 15);
		this.#earliestMonth = curMonth.copy().moveMonth(1);
		let maxMonth = new MonthIdentifier().setFromDate(new Date()).date;;
		
		let curMonthKey = false;
		let rows = [];

		while (curMonth.getTime() < maxMonth.getTime())
		{
			curMonth.moveMonth(1);

			for (let key of monthKeys)
			{
				if (key.id !== new MonthIdentifier().setFromDate(curMonth).id) continue;
				curMonthKey = key;
				break;
			}
		
			rows.push(this.renderRow(curMonth.copy(), curMonthKey, _expensesBudget));
		}


		for (let i = rows.length - 1; i >= 0; i--) this.#HTML.table.addRow(rows[i]);
	}


	renderRow(_curMonth, _curMonthKey, _expensesBudget) {
		let inputField = new UIMoneyInput({canBeNegative: true, onInput: () => {
			let id = new MonthIdentifier().setFromDate(_curMonth).id;
			_expensesBudget[id] = inputField.value;
			
			for (let i = 0; i < 3; i++) this.#addRowAtEnd(_expensesBudget);
		}});
		inputField.value = _expensesBudget[_curMonthKey.id];
		
		return new UITableRow({valueElements: [
			_curMonth.getMonths()[_curMonth.getMonth()].name + ' ' + _curMonth.getFullYear(),
			inputField.HTML,
		]});
	}

	#addRowAtEnd(_expensesBudget) {
		this.#earliestMonth.moveMonth(-1);
		this.#HTML.table.addRow(this.renderRow(this.#earliestMonth.copy(), new MonthIdentifier().setFromDate(this.#earliestMonth), _expensesBudget));
	}
	
	close() {
		super.close();
		this.#curExpensesBudget = {};
		this.#openPromiseResolver(false);
	}
}







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

		this.manageBudgetPopup = new BudgetManagementPage_manageBudgetPopup();
	}

	open() {
		super.open();
		this.render();
		this.updateBudgetDeficit();
	}


	render() {
		this.table.clear();
		for (let tag of TagManager.actualData)
		{
			let budgetTag = new BudgetPageTag(tag);
			this.table.addRow(budgetTag.renderRow());
		}

		this.HTML.budgetSumHolder = createElement('div', 'budgetSumHolder');

		let sumRow = new UITableRow({
			valueElements: [
				'Budget Surplus:',
				'',
				this.HTML.budgetSumHolder,
				'',
			]
		})

		this.table.addRow(sumRow);
	}

	updateBudgetDeficit() {
		this.budgetDeficit = TagManager.actualData.map(tag => tag.currentExpensesBudget).reduce((a, b) => a + b);
	}
}


class BudgetPageTag extends SavingsTransactionTag {
	#HTML = {};
	isSavingsTag = false;
	constructor({name, color, id, filter, expensesBudget, startValue = 0, isSavingsTag}) {
		super(...arguments);
		this.isSavingsTag = isSavingsTag;
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
		this.#HTML.moneyInputField = new UIMoneyInput({placeholder: '-', onInput: (_value) => this.#updateTagBudget()});

		let inputContainer = createElement('div', 'inputContainer');
		
		let editBudgetButton = createElement('img', 'editBudgetButton');
		editBudgetButton.setAttribute('src', 'images/monthIconDark.png');
		editBudgetButton.addEventListener('click', async () => {
			let budget = await App.budgetManagementPage.manageBudgetPopup.open(this);
			if (!budget) return;
			TagManager.getTagById(this.id).expensesBudget = budget;
			TagManager.writeData();
			App.budgetManagementPage.open();
		});

		inputContainer.append(this.#HTML.moneyInputField.HTML);
		inputContainer.append(editBudgetButton);

		this.#updateMoneyInputFieldValue(this.currentExpensesBudget);
		this.#HTML.isExpenseCheckbox.checked = this.currentExpensesBudget <= 0;

		return new UITableRow({
			valueElements: [
				this.render(),
				this.#HTML.isExpenseCheckbox.HTML,
				inputContainer,
				!this.isSavingsTag ? '-' : formatMoneyString(this.totalSavings, false)
			]
		})

	}
}



