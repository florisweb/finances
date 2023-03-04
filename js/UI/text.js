


class UITitle {
	#HTML = {};

	constructor({title, customClass}) {
		this.#HTML.self = createElement('div', 'UITitleHolder');
		if (customClass) this.#HTML.self.classList.add(customClass);
		this.setTitle(title);
	}

	setTitle(_title) {
		setTextToElement(this.#HTML.self, _title);
	}

	get HTML() {		
		return this.#HTML.self;
	}
}
