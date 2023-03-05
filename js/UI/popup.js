

class Popup {
	#HTML = {};

	get isOpen() {
		return !this.#HTML.holder.classList.contains('hide');
	}


	constructor({content = []}) {
		this.#HTML.holder = createElement('div', 'UIPopupHolder hide');
		this.#HTML.popup = createElement('div', 'popup');
		this.#HTML.holder.append(this.#HTML.popup);

		this.#HTML.holder.addEventListener('click', (_e) => {
			if (_e.target !== this.#HTML.holder) return;
			this.close();
		});

		for (let item of content)
		{
			if (typeof item === 'string')
			{
				let holder = createElement('div');
				setTextToElement(holder, item);
				this.#HTML.popup.append(holder);
				continue;
			} 
			if (!item.HTML) 
			{
				this.#HTML.popup.append(item);
				continue;
			}
			this.#HTML.popup.append(item.HTML);
		}


		document.body.append(this.#HTML.holder);
	}

	get HTML() {
		return this.#HTML.holder;
	}

	open() {
		this.#HTML.holder.classList.remove('hide');	
	}

	close() {
		this.#HTML.holder.classList.add('hide');
	}
}





