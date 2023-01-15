

class DropDown {
	#HTML = {};
	options = [];
	value;

	constructor({customClass}) {
		this.#HTML.self = createElement('div', 'UIDropDownWrapper');
		this.#HTML.button = createElement('div', 'dropDownButton');
		this.#HTML.button.innerHTML = `
			<img src='images/dropDownIconDark.png' class='dropDownIcon'>
			<div class='contentHolder'>Hey there!</div>
		`;

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

		option.onclick = () => this.selectOption(value, true);

		this.options.push({
			html: option,
			value: value,
			contentHTML: contentHTML,
		});

		this.#HTML.optionPanel.append(option);
	}

	get HTML() {		
		return this.#HTML.self;
	}

	onInput() {

	}


	selectOption(_value, _autoSelect = false) {
		for (let option of this.options)
		{
			if (_value !== option.value) continue;
			this.value = _value;
			this.#HTML.button.children[0].innerHTML = '';

			if (typeof option.contentHTML === 'string' || typeof option.contentHTML === 'number') 
			{
				setTextToElement(this.#HTML.button.children[0], option.contentHTML);
			} else this.#HTML.button.children[0].append(option.contentHTML);

			if (_autoSelect) return;
			return this.onInput(option);
		}
	}
}





