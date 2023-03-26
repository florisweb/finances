

class DropDown {
	#HTML = {};
	options = [];
	value;

	get isOpen() {
		return this.#HTML.self.classList.contains('optionPanelOpen');
	}


	constructor({customClass} = {customClass: ''}) {
		this.#HTML.self = createElement('div', 'UIDropDownWrapper');
		this.#HTML.button = createElement('div', 'dropDownButton');
		this.#HTML.button.innerHTML = `
			<img src='images/dropDownIconDark.png' class='dropDownIcon'>
			<div class='contentHolder'>Hey there!</div>
		`;

		this.#HTML.button.addEventListener('click', () => {
			if (this.isOpen) return this.close();
			return this.open();
		});

		this.#HTML.optionPanel = createElement('div', 'optionPanel');
		this.#HTML.self.append(this.#HTML.button);
		this.#HTML.self.append(this.#HTML.optionPanel);
	}


	addOption({contentHTML, value}) {
		let option = createElement('div', 'option')
		if (typeof contentHTML === 'string' || typeof contentHTML === 'number') 
		{
			setTextToElement(option, contentHTML);
		} else option.append(contentHTML);

		option.onclick = () => this.selectOption(value, false);

		this.options.push({
			html: option,
			value: value,
			contentHTML: contentHTML,
		});

		this.#HTML.optionPanel.append(option);
		if (this.value === undefined) this.selectOption(value, true);
	}

	get HTML() {		
		return this.#HTML.self;
	}

	onInput() {

	}


	selectOption(_value, _autoSelect = false, _customComparer) {
		for (let option of this.options)
		{
			if (_value !== option.value && (!_customComparer || !_customComparer(_value, option.value))) continue;
			this.value = _value;

			this.#HTML.button.children[1].innerHTML = '';

			if (typeof option.contentHTML === 'string' || typeof option.contentHTML === 'number') 
			{
				setTextToElement(this.#HTML.button.children[1], option.contentHTML);
			} else this.#HTML.button.children[1].append(option.contentHTML.cloneNode(true));

			this.close();
			if (_autoSelect) return;
			return this.onInput(option.value);
		}
	}


	async open() {
		let box = this.#HTML.optionPanel.getBoundingClientRect();
		let panelHeight = this.#HTML.optionPanel.offsetHeight;

		let topSpaceLeft = box.top - panelHeight;
		let bottomSpaceLeft = window.innerHeight - (box.top + panelHeight);

		let biggestSpace = Math.max(topSpaceLeft, bottomSpaceLeft);
		this.#HTML.optionPanel.style.maxHeight = (panelHeight + biggestSpace) + 'px';
		if (topSpaceLeft === biggestSpace) 
		{
			this.#HTML.optionPanel.style.transition = 'all 0s';
			this.#HTML.self.classList.add('openAbove');
			await wait(0);
			this.#HTML.optionPanel.style.transition = '';
		}

		await wait(0);
		this.#HTML.self.classList.add('optionPanelOpen');
	}

	close() {
		this.#HTML.self.classList.remove('optionPanelOpen');
		setTimeout(() => {
			this.#HTML.self.classList.remove('openAbove');
			this.#HTML.optionPanel.style.maxHeight = '';
		}, 300);
	}
}





