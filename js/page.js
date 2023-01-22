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
		App.curPage = this;
		for (let page of pages) page.classList.add('hide');
		pages[this.#pageIndex].classList.remove('hide');
	}
}





new class TransactionListViewerPage extends Page {
	table;
	constructor() {
		super({pageIndex: 0});
		this.table = new InfiniteScrollUITable({
			keys: ['Date', 'Type', 'targetName', 'deltaMoney', 'Description'], 
			customClass: 'transactionTable',
			badgeSize: 10,
		});
		this.pageHTML.append(this.table.HTML);

	}

	open(_transactions) {
		let rows = [];
		for (let transaction of _transactions)
		{
			let typeInput = new DropDown({customClass: 'typeSelector'});
			for (let tag of TagManager.tags) typeInput.addOption({contentHTML: tag.render(), value: tag.id});
			typeInput.selectOption(transaction.typeCode);

			// transaction.typeCode,
			let date = createElement('div', 'dateHolder');
			setTextToElement(date, transaction.date);
			if (transaction.tagAutoDetected) date.classList.add('tagAutoDetected');

			let row = new UITableRow({valueElements: [
				date,
				typeInput.HTML,
				transaction.targetName,
				transaction.deltaMoney,
				transaction.description
			]})
			rows.push(row);
		}

		this.table.setData(rows);

		super.open();
	}
}



new class MonthOverViewPage extends Page {
	constructor() {
		super({pageIndex: 1});
	}
}




const BankExportRowKeys = ['date', 'senderIBAN', 'targetIBAN', 'targetName', null, null, null, 'unit', 'balance', 'unit2', 'deltaMoney', 'date2', 'date3', null, null, null, null, 'description', 'xCode']

new class UploadCSVPage extends Page {
	#HTML = {};
	CSVReader = new CSVFileManager(BankExportRowKeys);

	constructor() {
		super({pageIndex: 2});
		this.#HTML.inputField = this.pageHTML.querySelector('input.CSVInputField');
		this.#HTML.inputField.addEventListener('change', (_e) => this.#onFileSelect(_e));
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
			transaction.tagAutoDetected = true;
			autoTypedTransactions.push(transaction);
		}
		
		transactions = autoTypedTransactions.concat(nonTypedTransactions);
		console.log(autoTypedTransactions);


		App.transactionListViewerPage.open(transactions);
	}
}
















