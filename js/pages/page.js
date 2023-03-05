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
			let tags = [new TransactionTag({id: 0, name: '---', color: new Color('rgba(0, 0, 0, 0)')}), ...TagManager.data];
			for (let tag of tags) typeInput.addOption({contentHTML: tag.render(), value: tag.id});

			typeInput.selectOption(transaction.typeCode);
			typeInput.onInput = (_value) => {transaction.typeCode = _value; TransactionManager.writeData()}

			let date = createElement('div', 'dateHolder');
			setTextToElement(date, transaction.date);
			if (transaction.tagAutoDetected) date.classList.add('tagAutoDetected');

			let row = new UITableRow({valueElements: [
				date,
				typeInput.HTML,
				transaction.targetName,
				formatMoneyString(transaction.deltaMoney),
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
			transaction.tagAutoDetected = true;
			autoTypedTransactions.push(transaction);
		}
		
		transactions = autoTypedTransactions.concat(nonTypedTransactions);
		transactions.sort((a, b) => new Date().fromString(a.date) > new Date().fromString(b.date))

		TransactionManager.addTransactions(transactions);
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















new class TagPage extends Page {
	HTML = {};
	table;
	#curTag;
	constructor() {
		super({pageIndex: 5});
		this.HTML.pageHeader = $('.tagPage .pageHeader')[0];
		this.HTML.pageTitleHolder = $('.tagPage .pageHeader .titleHolder')[0];
		this.HTML.tagContentHolder = $('.tagPage .tagContentHolder')[0];

		this.expensesGraph = new UILineGraph({title: 'Income'});
		this.expensesGraph.HTML.classList.add('expensesGraph');
		this.HTML.tagContentHolder.append(this.expensesGraph.HTML);


		this.HTML.removeButton = new UIButton({text: 'Remove', customClass: 'alignRight removeButton',  filled: true,  onclick: () => console.log('remove')});
		this.HTML.editButton = new UIButton({text: 'Edit', customClass: 'alignRight', filled: true, onclick: async () => {
			let tag = await App.tagManagementPage.createTagPopup.openEdit(this.#curTag);
			if (!tag) return;
			await TagManager.addTag(tag);
			this.open(tag);
		}});
		
		this.HTML.pageHeader.append(this.HTML.removeButton.HTML);
		this.HTML.pageHeader.append(this.HTML.editButton.HTML);
	}

	open(_tag) {
		if (!_tag) return;
		this.#curTag = _tag;
		super.open();
		setTextToElement(this.HTML.pageTitleHolder, _tag.name);

		let transactions = _tag.transactions;
		let expensesMap = new Map();
		let incomeMap = new Map();
		for (let t of transactions)
		{
			let date = new Date().setDateFromStr(t.date);
			let id = '1-' + date.getMonth() + '-' + date.getFullYear();
				
			if (t.deltaMoney < 0)
			{
				let output = expensesMap.get(id);
				if (!output) output = 0;
				output += -t.deltaMoney;
				expensesMap.set(id, output);
			} else {
				let output = incomeMap.get(id);
				if (!output) output = 0;
				output += t.deltaMoney;
				incomeMap.set(id, output);
			}
		}

		let expenses = [];
		for (let [date, money] of expensesMap)
		{
			expenses.push(new Vector(new Date().setDateFromStr(date).getTime(), money));	
		}
		let incomes = [];
		for (let [date, money] of incomeMap)
		{
			incomes.push(new Vector(new Date().setDateFromStr(date).getTime(), money));	
		}



		this.expensesGraph.setData([
			new LineGraphLineData({
				label: 'Expenses', 
				color: new Color('#f00'),
				data: expenses,
				doNotInterpolate: true,
			}),
			new LineGraphLineData({
				label: 'Income', 
				color: new Color('#0f0'),
				data: incomes,
				doNotInterpolate: true,
			})
		]);
	

		this.render();
	}


	render() {
		this.expensesGraph.render()
		// this.HTML.tagListHolder.innerHTML = '';

	}

}
