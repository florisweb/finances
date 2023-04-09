


class UITable {
	_HTML = {};
	#keys = [];
	constructor({keys = [], customClass}) {
		this._HTML.headerTable = createElement('table', 'UITable UIHeaderTable');
		this._HTML.table = createElement('table', 'UITable');
		this._HTML.self = createElement('div', 'UITableWrapper ' + (customClass ? customClass : ''));
		this._HTML.self.append(this._HTML.headerTable);
		this._HTML.self.append(this._HTML.table);
		this.#keys = keys;
		this.setKeys(keys);
		this.clear();
		window.addEventListener('resize', () => this.onResize());
	}

	setHeader(_row) {
		this._HTML.headerTable.innerHTML = '';
		this._HTML.headerTable.append(_row.HTML);
		this._updateUIHeaderTableSize();
	}
	addRow(_row) {
		this._HTML.table.append(_row.HTML);
		this._updateUIHeaderTableSize();
	}
	clear() {
		this._HTML.table.innerHTML = '';
		this.setKeys(this.#keys);
	}

	setKeys(_keys) {
		this.#keys = _keys;
		this.setHeader(new UIHeaderRow({valueElements: this.#keys}));
	}

	onResize() {
		this._updateUIHeaderTableSize();
	}
	async _updateUIHeaderTableSize() {
		let headerParts = this._HTML.headerTable.children[0].children;
		if (!this._HTML.table.children.length) return;
		let rowParts = this._HTML.table.children[0].children;
		if (!headerParts.length || !rowParts.length) return;

		for (let i = 0; i < headerParts.length; i++)
		{
			if (!rowParts[i]) continue;
			headerParts[i].style.width = '';
			rowParts[i].style.width = '';

			let maxWidth = Math.max(headerParts[i].offsetWidth, rowParts[i].offsetWidth);
			headerParts[i].style.width = maxWidth + 'px';
			rowParts[i].style.width = maxWidth + 'px';
		}
	}

	get HTML() {		
		return this._HTML.self;
	}
}



class UITableRow {
	#HTML = {};
	#valueElements;

	constructor({valueElements = []}) {
		this.#valueElements = valueElements;
	}

	get HTML() {	
		if (this.#HTML.self) return this.#HTML.self;
		
		this.#HTML.self = createElement('tr', 'tableRow');
		for (let valueEl of this.#valueElements)
		{
			this.#HTML.self.append(this._renderRowItem(valueEl));
		}
		return this.#HTML.self;
	}

	_renderRowItem(_valueEl) {
		let element = createElement('td', 'rowElement');
		if (typeof _valueEl === 'string' || typeof _valueEl === 'number') 
		{
			setTextToElement(element, _valueEl);
		} else element.append(_valueEl);
		return element;
	}
}

class UIHeaderRow extends UITableRow {
	isHeader = true;
	#sortableHeaderItems = [];

	_renderRowItem(_valueEl) {
		let element = createElement('th', 'rowElement isHeader');

		if (_valueEl instanceof UISortableHeaderItem)
		{
			this.#sortableHeaderItems.push(_valueEl);
			_valueEl.setHeaderRow(this);
			element.append(_valueEl.HTML);
		} else if (typeof _valueEl === 'string' || typeof _valueEl === 'number') 
		{
			setTextToElement(element, _valueEl);
		} else element.append(_valueEl);

		return element;
	}


	_onSort(_headerItem) {
		for (let HI of this.#sortableHeaderItems)
		{
			if (HI === _headerItem) continue;
			HI.onOtherSortingMethodSelect();
		}
	}
}




class UISortableHeaderItem {
	#HTML;
	#title = '---';
	#headerRow;
	constructor({title, sortFunction}) {
		this.#title = title;
		this.#HTML = createElement('div', 'UISortableHeaderItem');
		setTextToElement(this.#HTML, this.#title);
		let topSort = false;

		this.#HTML.onclick = () => {
			topSort = !topSort;
			sortFunction(topSort);
			setTextToElement(this.#HTML, (topSort ? '▲ ' : '▼ ') + this.#title);
			if (this.#headerRow) this.#headerRow._onSort(this);
		}
	}
	onOtherSortingMethodSelect() {
		setTextToElement(this.#HTML, this.#title);
	}

	get HTML() {
		return this.#HTML;
	}

	setHeaderRow(_headerRow) {
		this.#headerRow = _headerRow;
	}
}







class InfiniteScrollUITable extends UITable {
	#visibleItems = 10;
	#curDataIndex = 0; // As defined to be the first one visible
	#data = [];
	constructor({keys = [], customClass, visibleItems = 20}) {
		super({keys: keys, customClass: customClass});
		this.#visibleItems = visibleItems;

		this.HTML.classList.add('infiniteScroll');

		this.HTML.addEventListener('scroll', (_e) => this.#onScroll(_e));
	}


	setData(_data) {
		this.#data = _data;
		this._HTML.table.innerHTML = '';
		for (let i = 0; i < this.#visibleItems; i++)
		{
			if (!this.#data[i]) continue;
			this._HTML.table.append(this.#data[i].HTML);
		}
		this.#onScroll();
	}
	setPointer(_index) {
		this.#curDataIndex = _index;
	}

	
	async #onScroll() {
		const scrollMargin = 1000;

		let tableHeight = this._HTML.table.offsetHeight;
		let distanceFromTop = this.HTML.scrollTop - scrollMargin;
		if (this.#curDataIndex === 0 && distanceFromTop < 0)
		{
			this.HTML.scrollTop -= distanceFromTop;
			return;
		}


		let scrollPosAtBottomTable = tableHeight - this.HTML.scrollTop;
		let distanceFromBottom = scrollPosAtBottomTable - this.HTML.offsetHeight - scrollMargin;

		if (this.#curDataIndex > this.#data.length - this.#visibleItems - 2 && distanceFromBottom < 0)
		{
			this.HTML.scrollTop += distanceFromBottom;
			return;
		}

		this._updateUIHeaderTableSize();

		if (this.#curDataIndex > 0 && distanceFromTop < 0)
		{
			this.#addRowBefore();
			wait(0).then(() => this.#onScroll());
		} else if (this.#curDataIndex <= this.#data.length - this.#visibleItems - 2 && distanceFromBottom < 0)
		{
			this.#addRowAfter();
			wait(0).then(() => this.#onScroll());
		} 
	}

	#addRowBefore() {
		this.#curDataIndex--;
		let row = this.#data[this.#curDataIndex];
		let before = this._HTML.table.children[1];
		this._HTML.table.insertBefore(row.HTML, before);
		this.HTML.scrollTop += row.HTML.offsetHeight;
		
		let child = this._HTML.table.children[this._HTML.table.children.length - 1];
		this._HTML.table.removeChild(child);	
	}

	#addRowAfter() {
		this.#curDataIndex++;
		let row = this.#data[this.#curDataIndex + this.#visibleItems];
		this._HTML.table.append(row.HTML);
		let childHeight = this._HTML.table.children[1].offsetHeight;
		this._HTML.table.removeChild(this._HTML.table.children[1]);
		this.HTML.scrollTop -= childHeight;
	}
}



class InfiniteScrollTransactionTable extends InfiniteScrollUITable {
	#transactions = [];
	constructor() {
		super({
			...arguments,
			keys: [
				new UISortableHeaderItem({title: 'Date', sortFunction: (topSort) => this.sortByDate(topSort)}), 
				new UISortableHeaderItem({title: 'Type', sortFunction: (topSort) => this.sortByType(topSort)}), 
				'Target Name', 
				new UISortableHeaderItem({title: 'Money', sortFunction: (topSort) => this.sortByMoney(topSort)}), 
				'Description'
			], 
		});
	}

	setTransactions(_transactions = []) {
		this.#transactions = _transactions;
	}

	showTransactions(_transactions = this.#transactions) {
		let rows = [];
		for (let transaction of _transactions)
		{
			let typeInput = new DropDown({customClass: 'typeSelector'});
			let tags = [new TransactionTag({id: 0, name: '---', color: new Color('rgba(0, 0, 0, 0)')}), ...TagManager.data];
			for (let tag of tags) typeInput.addOption({contentHTML: tag.render(), value: tag.id});

			typeInput.selectOption(transaction.typeCode);
			typeInput.onInput = (_value) => {transaction.typeCode = _value; transaction.classificationState = 2; TransactionManager.writeData()}

			let date = createElement('div', 'dateHolder');
			setTextToElement(date, transaction.date);
			if (transaction.classificationState === 1) date.classList.add('tagAutoDetected');
			if (transaction.classificationState === 2) date.classList.add('tagManuallySet');

			let row = new UITableRow({valueElements: [
				date,
				typeInput.HTML,
				transaction.targetName,
				formatMoneyString(transaction.deltaMoney),
				transaction.description
			]})
			rows.push(row);
		}

		this.setData(rows);
	}


	clearFilters() {
		this.showTransactions(this.#transactions);		
	}


	filterNonAssigned() {
		let transactions = [];
		for (let ts of this.#transactions)
		{
			if (typeof ts.typeCode === 'number') continue;
			transactions.push(ts);
		}
		this.showTransactions(transactions);
	}



	sortByDate(_topSort) {
		this.#transactions.sort((a, b) => {
			if (_topSort) return new Date().fromString(a.date) < new Date().fromString(b.date);
			return new Date().fromString(a.date) > new Date().fromString(b.date)
		});
		this.showTransactions(this.#transactions);
	}
	sortByType(_topSort) {
		this.#transactions.sort((a, b) => {
			let aTypeCode = a.typeCode === undefined ? -1 : a.typeCode;
			let bTypeCode = b.typeCode === undefined ? -1 : b.typeCode;
			if (_topSort) return aTypeCode < bTypeCode;
			return aTypeCode > bTypeCode;
		});
		this.showTransactions(this.#transactions);
	}

	sortByMoney(_topSort) {
		this.#transactions.sort((a, b) => {
			if (_topSort) return parseFloat(a.deltaMoney) < parseFloat(b.deltaMoney);
			return parseFloat(a.deltaMoney) > parseFloat(b.deltaMoney);
		});
		this.showTransactions(this.#transactions);
	}


	search(_query) {
		this.#transactions.sort((a, b) => this.#getTransactionScoreByQuery(a, _query) < this.#getTransactionScoreByQuery(b, _query));
		let subSet = Object.assign([], this.#transactions).splice(0, 50);
		this.showTransactions(subSet);
		this.setPointer(0);
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



