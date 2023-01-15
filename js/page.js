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
		this.table = new UITable({keys: ['Date', 'Type', 'targetIBAN', 'targetName', 'deltaMoney', 'Description']});
		this.pageHTML.append(this.table.HTML);

	}

	open(_transactions) {
		for (let transaction of _transactions)
		{
			let row = new UITableRow({valueElements: [
				transaction.date,
				transaction.typeCode,
				transaction.targetIBAN,
				transaction.targetName,
				transaction.deltaMoney,
				transaction.description
			]})
			this.table.addRow(row)
		}

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
		App.transactionListViewerPage.open(transactions);
	}
}
















