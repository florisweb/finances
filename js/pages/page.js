const Pages = {};

class Page {
	#pageIndex;
	constructor({pageIndex}) {
		this.#pageIndex = pageIndex;
		let pageName = this.constructor.name.substr(0, 1).toLocaleLowerCase() + this.constructor.name.substr(1, this.constructor.name.length);
		Pages[pageName] = this;
	}

	get isOpen() {
		return App.curPage === this;
	}
	get pageHTML() {
		let pages = document.querySelectorAll('#mainContent .page');
		return pages[this.#pageIndex];
	}

	open() {
		let pages = document.querySelectorAll('#mainContent .page');
		if (App.curPage) App.curPage.close();
		App.curPage = this;
		for (let page of pages) page.classList.add('hide');
		pages[this.#pageIndex].classList.remove('hide');
	}
	close() {}
}





new class TransactionListViewerPage extends Page {
	HTML = {};
	table;
	constructor() {
		super({pageIndex: 0});
		
		this.HTML.searchField = document.querySelector('.page.transactionListViewerPage .searchField');
		this.HTML.searchField.addEventListener('input', () => this.search(this.HTML.searchField.value))

		this.table = new InfiniteScrollTransactionTable({
			customClass: 'transactionTable',
			badgeSize: 10,
		});
		this.pageHTML.append(this.table.HTML);
	}

	open(_transactions) {
		this.table.setTransactions(_transactions);
		this.table.showTransactions();
		super.open();
	}

	clearFilters() {
		this.table.clearFilters();
	}

	search() {
		this.table.search(...arguments);
	}
}





const BankExportRowKeys = ['date', 'senderIBAN', 'targetIBAN', 'targetName', null, null, null, 'unit', 'balance', 'unit2', 'deltaMoney', 'date2', 'date3', 'bankClassification', null, null, null, 'description', null]

new class UploadCSVPage extends Page {
	#HTML = {};
	CSVReader = new CSVFileManager(BankExportRowKeys);

	constructor() {
		super({pageIndex: 2});
		this.#HTML.inputField = this.pageHTML.querySelector('input.CSVInputField');
		this.#HTML.transactionCountHolder = this.pageHTML.querySelector('.transactionCountHolder');
		this.#HTML.inputField.addEventListener('change', (_e) => this.#onFileSelect(_e));
	}

	open() {
		super.open();
		setTextToElement(this.#HTML.transactionCountHolder, "Transactions: " + TransactionManager.data.length);
	}
	

	async #onFileSelect(e) {
		const input = e.target
	  	if (!input) throw new Error('null input')
	  	const [first] = input.files
		let rows = await this.CSVReader.load(first);
		let transactions = rows.map(row => new Transaction(row));

		let autoTypedTransactions = [];
		let nonTypedTransactions = [];
		for (let transaction of transactions)
		{
			let type = TagManager.autoDetectTransactionTag(transaction);
			if (type === false) 
			{
				nonTypedTransactions.push(transaction)
				continue;
			}
			transaction.typeCode = type;
			autoTypedTransactions.push(transaction);
		}
		
		transactions = autoTypedTransactions.concat(nonTypedTransactions);
		transactions.sort((a, b) => new Date().fromString(a.date) > new Date().fromString(b.date))

		TransactionManager.addTransactions(transactions);
		TransactionManager.autoClassifyTransactions();
		App.transactionListViewerPage.open(TransactionManager.data);
	}
}



















new class TagOverviewPage extends Page {
	table;
	constructor() {
		super({pageIndex: 3});
		
		this.table = new UITable({
			keys: [],
			customClass: 'tagOverviewTable',
		});
		this.pageHTML.append(this.table.HTML);
	}

	open() {
		if (!TransactionManager.data.length) return;
		
		this.table.clear();
		let keys = ['Month', 'Sum'];
		for (let i = 1; i < TagManager.data.length; i++) keys.push(TagManager.data[i].name);
		keys.push('Non Assigned');
		this.table.setKeys(keys);


		// Get data per tag
		let tagData = [];
		for (let i = 1; i < TagManager.data.length; i++)
		{
			tagData.push(TransactionManager.getByTag(TagManager.data[i].id));
		}
		tagData.push(TransactionManager.getByTag(undefined)); // Also add the non assigned transactions

		
		// Get first transactions's date
		TransactionManager.data.sort((a, b) => new Date().fromString(a.date) > new Date().fromString(b.date));
		let timeString = TransactionManager.data[0].date;
		if (!timeString) timeString = TransactionManager.data[1].date;
		let curDate = new Date().fromString(timeString);
		curDate.setDate(1);


		let lastDateTimeString = TransactionManager.data[TransactionManager.data.length - 1].date;
		let lastDate = new Date().fromString(lastDateTimeString);
		lastDate.setDate(1);

		// Calc transaction sum per tag
		let tagDataPerMonth = [];
		let moneyPerTag = [0];

		for (let i = 0; i < tagData.length; i++)
		{
			let transactions = tagData[i];
			let months = {};
			let totalSum = 0;

			for (let ts of transactions)
			{
				let date = new Date().fromString(ts.date);

				let dateKey = date.getMonth() + '|' + date.getFullYear();
				if (!months[dateKey]) months[dateKey] = 0;
				months[dateKey] += parseFloat(ts.deltaMoney);
				totalSum += parseFloat(ts.deltaMoney);
			}

			tagDataPerMonth[i] = months;
			moneyPerTag.push(totalSum);
			moneyPerTag[0] += totalSum;
		}


		// Render table
		while (curDate.getDateInDays(true) <= lastDate.getDateInDays(true))
		{
			let nextMonth = curDate.copy().moveMonth(1);
			let value = [
				curDate.getMonths()[curDate.getMonth()].name + ' ' + curDate.getFullYear(),
				createElement('strong')
			];
			
			let dateKey = curDate.getMonth() + '|' + curDate.getFullYear();


			let totalSum = 0;
			for (let tag of tagDataPerMonth)
			{
				let monthSum = tag[dateKey];
				if (!monthSum) monthSum = 0;
				value.push(monthSum);
				totalSum += monthSum;
			}
			setTextToElement(value[1], Math.round(totalSum * 100) / 100);

			let row = new UITableRow({valueElements: formatValues(value)});
			this.table.addRow(row);
			curDate.moveMonth(1);
		}


		function formatValues(_values) {
			let values = [_values[0], _values[1], ..._values.splice(2, Infinity).map((v) => {
				if (v === 0) return '-';
				return formatMoneyString(v, false);
			})];
			return values;
		}


		// Add per tag sum:
		let row = new UITableRow({valueElements: ['- Sum', ...moneyPerTag.map(m => formatMoneyString(m, false))]});
		this.table.addRow(row);
		super.open();
	}
}



