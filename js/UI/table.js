


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
		this.clear();
	}

	setHeader(_row) {
		this._HTML.headerTable.innerHTML = '';
		console.log(_row.HTML);
		this._HTML.headerTable.append(_row.HTML);
		this._updateUIHeaderTableSize();
	}
	addRow(_row) {
		this._HTML.table.append(_row.HTML);
	}
	clear() {
		this._HTML.table.innerHTML = '';
		this.setHeader(new UIHeaderRow({valueElements: this.#keys}));
	}

	_updateUIHeaderTableSize() {
		let headerParts = this._HTML.headerTable.children[0].children;
		if (!this._HTML.table.children.length) return;
		let rowParts = this._HTML.table.children[0].children;
		if (!headerParts.length || !rowParts.length) return;

		for (let i = 0; i < headerParts.length; i++)
		{
			if (!rowParts[i]) continue;
			headerParts[i].style.width = rowParts[i].offsetWidth + 'px';
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

	
	async #onScroll() {
		this._updateUIHeaderTableSize();
		const scrollMargin = 1000;

		for (let i = 0; i < 5; i++)
		{
			await wait(0);
			let tableHeight = this._HTML.table.offsetHeight;
			let distanceFromTop = this.HTML.scrollTop - scrollMargin;
			if (this.#curDataIndex === 0 && distanceFromTop < 0)
			{
				this.HTML.scrollTop -= distanceFromTop;
				continue;
			}

			let scrollPosAtBottomTable = tableHeight - this.HTML.scrollTop;
			let distanceFromBottom = scrollPosAtBottomTable - this.HTML.offsetHeight - scrollMargin;

			if (this.#curDataIndex > this.#data.length - this.#visibleItems - 2 && distanceFromBottom < 0)
			{
				this.HTML.scrollTop += distanceFromBottom;
				continue;
			}


			if (this.#curDataIndex > 0 && distanceFromTop < 0)
			{
				this.#addRowBefore();
			} else if (this.#curDataIndex <= this.#data.length - this.#visibleItems - 2 && distanceFromBottom < 0)
			{
				this.#addRowAfter();
			} 
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




