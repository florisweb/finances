

class UIStatusMessage {
	#HTML = {};

	get isOpen() {
		return !this.#HTML.messageHolder.classList.contains('hide');
	}

	constructor({content, customClass}) {
		this.#HTML.messageHolder = createElement('div', 'UIStatusMessage hide');

		for (let item of content)
		{
			if (typeof item === 'string')
			{
				let holder = createElement('div');
				setTextToElement(holder, item);
				this.#HTML.messageHolder.append(holder);
				continue;
			} 
			if (!item.HTML) 
			{
				this.#HTML.messageHolder.append(item);
				continue;
			}
			this.#HTML.messageHolder.append(item.HTML);
		}


		document.body.append(this.#HTML.messageHolder);
	}

	get HTML() {
		return this.#HTML.messageHolder;
	}

	open() {
		this.#HTML.messageHolder.classList.remove('hide');	
	}

	close() {
		this.#HTML.messageHolder.classList.add('hide');
	}
}





