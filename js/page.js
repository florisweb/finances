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
	HTML = {};
	table;
	#transactions = [];
	constructor() {
		super({pageIndex: 0});
		
		this.HTML.searchField = document.querySelector('.page.transactionListViewerPage .searchField');
		this.HTML.searchField.addEventListener('input', () => this.search(this.HTML.searchField.value))

		this.table = new InfiniteScrollUITable({
			keys: [
				new UISortableHeaderItem({title: 'Date', sortFunction: (topSort) => this.sortByDate(topSort)}), 
				new UISortableHeaderItem({title: 'Type', sortFunction: (topSort) => this.sortByType(topSort)}), 
				'Target Name', 
				new UISortableHeaderItem({title: 'Money', sortFunction: (topSort) => this.sortByMoney(topSort)}), 
				'Description'
			], 
			customClass: 'transactionTable',
			badgeSize: 10,
		});
		this.pageHTML.append(this.table.HTML);
	}

	open(_transactions) {
		this.#transactions = _transactions;
		this.#updateTable();

		super.open();
	}

	#updateTable(_transactions = this.#transactions) {
		let rows = [];
		for (let transaction of _transactions)
		{
			let typeInput = new DropDown({customClass: 'typeSelector'});
			for (let tag of TagManager.tags) typeInput.addOption({contentHTML: tag.render(), value: tag.id});
			typeInput.selectOption(transaction.typeCode);
			typeInput.onInput = (_value) => {transaction.typeCode = _value; DataManager.saveTransactions()}

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
	}

	clearFilters() {
		this.#updateTable();		
	}

	filterNonAssigned() {
		let transactions = [];
		for (let ts of this.#transactions)
		{
			if (typeof ts.typeCode === 'number') continue;
			transactions.push(ts);
		}
		console.log(transactions);
		this.#updateTable(transactions);
	}


	
	sortByDate(_topSort) {
		this.#transactions.sort((a, b) => {
			if (_topSort) return new Date().fromString(a.date) < new Date().fromString(b.date);
			return new Date().fromString(a.date) > new Date().fromString(b.date)
		});
		this.#updateTable();	
	}
	sortByType(_topSort) {
		this.#transactions.sort((a, b) => {
			let aTypeCode = a.typeCode === undefined ? -1 : a.typeCode;
			let bTypeCode = b.typeCode === undefined ? -1 : b.typeCode;
			if (_topSort) return aTypeCode < bTypeCode;
			return aTypeCode > bTypeCode;
		});
		this.#updateTable();	
	}

	sortByMoney(_topSort) {
		this.#transactions.sort((a, b) => {
			if (_topSort) return parseFloat(a.deltaMoney) < parseFloat(b.deltaMoney);
			return parseFloat(a.deltaMoney) > parseFloat(b.deltaMoney);
		});
		this.#updateTable();	
	}

	search(_query) {
		this.#transactions.sort((a, b) => this.#getTransactionScoreByQuery(a, _query) < this.#getTransactionScoreByQuery(b, _query));
		let subSet = Object.assign([], this.#transactions).splice(0, 50);
		this.#updateTable(subSet);
		this.table.setPointer(0);
	}

	#getTransactionScoreByQuery(_transaction, _query) {
		let tag = TagManager.getTagById(_transaction.typeCode);

		let scoreDesc = this.stringSimilarity(_transaction.description, _query);
		let scoreTarget = this.stringSimilarity(_transaction.targetName, _query);
		let scoreTag = tag ? this.stringSimilarity(tag.name, _query) : 0;
		return scoreDesc * 5 + scoreTarget + scoreTag;
		
	}

	stringSimilarity(_string, _query) {
		return similarity(_string, _query);

		// let scores = [];
		// for (let i = 0; i < _query.length + 1; i++)
		// {
		// 	let curSubString = _query.substr(0, i);
		// 	let curItemTitle = _string.substr(0, i);
		// 	let score = similarity(curSubString, curItemTitle) - Math.abs(i - _query.length) * .1;
		// 	let item = {
		// 		str: curSubString,
		// 		score: i == 0 ? 0 : score,
		// 	}
		// 	scores.push(item);
		// }

		// if (scores.length < 1) return 0;
		// return scores.sort(function(a, b){
	    //  	return b.score - a.score;
	    // })[0].score;
	}

}





const BankExportRowKeys = ['date', 'senderIBAN', 'targetIBAN', 'targetName', null, null, null, 'unit', 'balance', 'unit2', 'deltaMoney', 'date2', 'date3', null, null, null, null, 'description', 'xCode']

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
		setTextToElement(this.#HTML.transactionCountHolder, "Transactions: " + DataManager.transactions.length);
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
		transactions.sort((a, b) => new Date().fromString(a.date) > new Date().fromString(b.date))

		DataManager.addTransactions(transactions);
		App.transactionListViewerPage.open(DataManager.transactions);
	}
}



















new class TagOverviewPage extends Page {
	table;
	constructor() {
		super({pageIndex: 3});
		let keys = ['Month', 'Sum'];
		for (let i = 1; i < TagManager.tags.length; i++) keys.push(TagManager.tags[i].name);
		keys.push('Non Assigned');

		this.table = new UITable({
			keys: keys,
			customClass: 'tagOverviewTable',
		});
		this.pageHTML.append(this.table.HTML);
	}

	open() {
		if (!DataManager.transactions.length) return;
		this.table.clear();

		// Get data per tag
		let tagData = [];
		for (let i = 1; i < TagManager.tags.length; i++)
		{
			tagData.push(DataManager.getByTag(TagManager.tags[i].id));
		}
		tagData.push(DataManager.getByTag(undefined)); // Also add the non assigned transactions

		
		// Get first transactions's date
		DataManager.transactions.sort((a, b) => new Date().fromString(a.date) > new Date().fromString(b.date));
		let timeString = DataManager.transactions[0].date;
		if (!timeString) timeString = DataManager.transactions[1].date;
		let curDate = new Date().fromString(timeString);
		curDate.setDate(1);


		let lastDateTimeString = DataManager.transactions[DataManager.transactions.length - 1].date;
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
				value.push(Math.round(monthSum * 100) / 100);
				totalSum += monthSum;
			}
			setTextToElement(value[1], Math.round(totalSum * 100) / 100);
			let row = new UITableRow({valueElements: value});
			this.table.addRow(row);
			curDate.moveMonth(1);
		}



		// Add per tag sum:		
		let row = new UITableRow({valueElements: ['- Sum', ...moneyPerTag.map(m => Math.round(m * 100) / 100)]});
		this.table.addRow(row);
		super.open();
	}
}






new class TagManagementPage extends Page {
	HTML = {};
	table;
	constructor() {
		super({pageIndex: 4});
		this.HTML.tagListHolder = $('.tagManagementPage .tagListHolder')[0];

	}

	open() {
		super.open();
		this.render();
	}


	render() {
		this.HTML.tagListHolder.innerHTML = '';
		for (let tag of TagManager.tags)
		{
			let tagItem = new ManagementPageTag(tag);
			this.HTML.tagListHolder.append(tagItem.render());
		}


		let tagItem = new AddManagementPageTag();
		this.HTML.tagListHolder.append(tagItem.render());
	}

}

class ManagementPageTag extends TransactionTag {
	constructor({name, color, id, filter}) {
		super({name: name, color: color, id: id, filter: filter});
	}

	render() {
		let element = createElement('div', 'tagPanel');
		element.innerHTML = `
			<div class='tagTitleHolder'></div>
			<div class='savingInfoHolder'></div>
		`;

		element.style.borderBottomColor = this.color.hex;

		element.children[0].append(super.render());
		setTextToElement(element.children[1], "Savings: €20.30");

		return element;
	}
}

class AddManagementPageTag extends ManagementPageTag {
	constructor() {
		super({name: '', color: new Color('#ccc')});
	}

	render() {
		let html = super.render();
		html.classList.add('addTagPanel');
		html.innerHTML = `
			<div class='tagTitleHolder'>
				<div class='tag'>
					<div class="tagIndicator">+</div>
					<div class="tagNameHolder">Add Tag</div>
				</div>
			</div>
		`;
		return html;
	}
}

