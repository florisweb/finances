

class UITable {
	#HTML = {};
	rows = [];
	constructor({keys = []}) {
		this.#HTML.self = createElement('table', 'UITable');
		this.addRow(new UITableRow({valueElements: keys, isHeader: true}));
	}

	addRow(_row, _index = this.rows.length) {
		this.rows[_index] = _row;
		this.#HTML.self.append(_row.HTML);
	}

	get HTML() {		
		return this.#HTML.self;
	}

}

class UITableRow {
	#HTML = {};
	constructor({valueElements = [], isHeader = false}) {
		this.#HTML.self = createElement('tr', 'tableRow');
		
		for (let valueEl of valueElements)
		{
			let element = createElement(isHeader ? 'th' : 'td', 'rowElement ' + (isHeader ? 'isHeader' : ''));

			if (typeof valueEl === 'string' || typeof valueEl === 'number') 
			{
				setTextToElement(element, valueEl);
			} else element.append(valueEl);

			this.#HTML.self.append(element);
		}
	}

	get HTML() {		
		return this.#HTML.self;
	}
}

