


class UITable {
	_HTML = {};
	rows = [];
	#keys = [];
	constructor({keys = [], customClass}) {
		this._HTML.table = createElement('table', 'UITable');
		this._HTML.self = createElement('div', 'UITableWrapper ' + (customClass ? customClass : ''));
		this._HTML.self.append(this._HTML.table);
		this.#keys = keys;
		this.clear();
	}

	addRow(_row, _index = this.rows.length) {
		this.rows[_index] = _row;
		this._HTML.table.append(_row.HTML);
	}
	clear() {
		this.rows = [];
		this._HTML.table.innerHTML = '';
		this.addRow(new UITableRow({valueElements: this.#keys, isHeader: true}));
	}

	get HTML() {		
		return this._HTML.self;
	}
}



class UITableRow {
	#HTML = {};
	#valueElements;
	isHeader = false;
	constructor({valueElements = [], isHeader = false}) {
		this.#valueElements = valueElements;
		this.isHeader = isHeader;
	}

	get HTML() {	
		if (this.#HTML.self) return this.#HTML.self;
		
		this.#HTML.self = createElement('tr', 'tableRow');
		
		for (let valueEl of this.#valueElements)
		{
			let element = createElement(this.isHeader ? 'th' : 'td', 'rowElement ' + (this.isHeader ? 'isHeader' : ''));

			if (typeof valueEl === 'string' || typeof valueEl === 'number') 
			{
				setTextToElement(element, valueEl);
			} else element.append(valueEl);

			this.#HTML.self.append(element);
		}
		return this.#HTML.self;
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
		for (let i = 0; i < this.#visibleItems; i++)
		{
			if (!this.#data[i]) continue;
			this._HTML.table.append(this.#data[i].HTML);
		}
		this.#onScroll();
	}

	
	#onScroll() {
		const scrollMargin = 1000;

		for (let i = 0; i < 5; i++)
		{
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




