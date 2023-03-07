


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

class UIText {
	#HTML = {};

	constructor({text, customClass}) {
		this.#HTML.self = createElement('div', 'UIText');
		if (customClass) this.#HTML.self.classList.add(customClass);
		this.setText(text);
	}

	setText(_text) {
		setTextToElement(this.#HTML.self, _text);
	}

	get HTML() {		
		return this.#HTML.self;
	}
}





class UIVerticalSpacer {
	#HTML = {};
	constructor({height = 30} = {height: 30}) {
		this.#HTML.self = createElement('div', 'UIVerticalSpacer');
		this.#HTML.self.style.height = height + 'px';
	}
	get HTML() {		
		return this.#HTML.self;
	}
}


class UIInput {
	#HTML = {};

	get value() {
		return this.#HTML.self.value;
	}
	set value(_value) {
		this.#HTML.self.value = _value;
	}

	constructor({placeholder = '', customClass, onChange}) {
		this.#HTML.self = createElement('input', 'UIInputHolder');
		if (customClass) this.#HTML.self.classList.add(customClass);
		this.#HTML.self.setAttribute('placeholder', placeholder)
		if (onChange) this.#HTML.self.addEventListener('change', (_e) => onChange(this.value, _e));
	}

	setTitle(_title) {
		setTextToElement(this.#HTML.self, _title);
	}
	focus() {
		this.#HTML.self.focus();
	}

	get HTML() {		
		return this.#HTML.self;
	}
}







class UIButton {
	#HTML = {};
	constructor({text, onclick, filled, customClass}) {
		this.#HTML.self = createElement('div', 'UIButton');
		if (filled) this.#HTML.self.classList.add('filled');
		if (customClass) this.#HTML.self.className += ' ' + customClass;
		this.setText(text);
		if (onclick) this.#HTML.self.onclick = onclick;
	}
	setText(_text) {
		setTextToElement(this.#HTML.self, _text);
	}
	get HTML() {		
		return this.#HTML.self;
	}
}



class UIHorizontalSegment {
	#HTML = {};
	constructor({content}) {
		this.#HTML.self = createElement('div', 'UIHorizontalSegment');
		
		for (let item of content)
		{
			if (typeof item === 'string')
			{
				let holder = createElement('div');
				setTextToElement(holder, item);
				this.#HTML.self.append(holder);
				continue;
			} 
			if (!item.HTML) 
			{
				this.#HTML.self.append(item);
				continue;
			}
			this.#HTML.self.append(item.HTML);
		}
	}

	get HTML() {		
		return this.#HTML.self;
	}
}











class UICheckbox {
	#HTML = {};

	get checked() {
		return this.#HTML.checkbox.checked;
	}
	set checked(_on) {
		this.#HTML.checkbox.checked = !!_on;
	}

	constructor({text, customClass, onChange}) {
		this.#HTML.self = createElement('div', 'UICheckboxHolder');
		if (customClass) this.#HTML.self.className += ' ' + customClass;
		let id = newId();
		this.#HTML.self.innerHTML = `
			<input type="checkbox" id="` + id + `" value="Bike">
  			<label for="` + id + `"> </label>
		`;

		this.#HTML.checkbox = this.#HTML.self.children[0];
		this.#HTML.label = this.#HTML.self.children[1];

		this.setText(text);
	}

	setText(_text) {
		setTextToElement(this.#HTML.label, _text);
	}

	get HTML() {		
		return this.#HTML.self;
	}
}

