




class TagManagementPage_createTagPopup extends Popup {
	#openPromiseResolver;
	#HTML = {};
	#curEditTag = false;
	constructor() {
		let titleHolder = new UITitle({title: 'Create Tag'});
		let input = new UIInput({placeholder: "Tag Name...", onChange: () => console.log('hey')});
		let dropDown = new DropDown({});
		let addButton = new UIButton({text: 'Add', customClass: 'alignRight', filled: true, onclick: () => this.createTag()});


		for (let colorOption of TagManager.availableColors)
		{
			let visualTag = new TransactionTag({color: colorOption.color, name: colorOption.name});
			dropDown.addOption({
				contentHTML: visualTag.render(), 
				value: colorOption.color
			});
		}

		super({
			content: [
				titleHolder,
				new UIVerticalSpacer({height: 20}),
				input,
				new UIVerticalSpacer({height: 20}),
				dropDown,
				new UIVerticalSpacer({height: 80}),
				new UIHorizontalSegment({content: [
					addButton,
					new UIButton({text: 'Cancel', customClass: 'alignRight', onclick: () => this.close()})
				]})
			],
			customClass: "createTagPopup"
		})
		this.#HTML.input = input;
		this.#HTML.dropDown = dropDown;
		this.#HTML.titleHolder = titleHolder;
		this.#HTML.addButton = addButton;
	}



	createTag() {
		if (this.#HTML.input.value.length < 3) return alert('Please choose a longer name');

		if (this.#curEditTag)
		{
			this.#curEditTag.name = this.#HTML.input.value;
			this.#curEditTag.color = this.#HTML.dropDown.value
			this.#openPromiseResolver(this.#curEditTag);
			return this.close();
		}

		let tag = new TransactionTag({id: TagManager.getNewTagId(), name: this.#HTML.input.value, color: this.#HTML.dropDown.value});
		this.#openPromiseResolver(tag);
		return this.close();
	}

	open() {
		this.#HTML.titleHolder.setTitle('Create Tag');
		this.#HTML.addButton.setText('Add');
		super.open();
		this.#HTML.input.value = null;
		this.#HTML.input.focus();
		return new Promise((resolver) => this.#openPromiseResolver = resolver);
	}

	openEdit(_tag) {
		this.#HTML.titleHolder.setTitle('Edit Tag');
		this.#HTML.addButton.setText('Save');

		super.open();
		this.#curEditTag = _tag;
		this.#HTML.input.value = _tag.name;
		this.#HTML.input.focus();

		this.#HTML.dropDown.selectOption(_tag.color, true, (a, b) => a.hex === b.hex);

		return new Promise((resolver) => this.#openPromiseResolver = resolver);
	}

	close() {
		super.close();
		this.#curEditTag = false;
		this.#HTML.dropDown.close();
		this.#openPromiseResolver(false);
	}
}











new class TagManagementPage extends Page {
	HTML = {};
	table;
	constructor() {
		super({pageIndex: 4});
		this.HTML.tagListHolder = $('.tagManagementPage .tagListHolder')[0];


		this.createTagPopup = new TagManagementPage_createTagPopup();
	}

	open() {
		super.open();
		this.render();
	}


	render() {
		this.HTML.tagListHolder.innerHTML = '';
		let items = 0;
		for (let tag of TagManager.data)
		{
			let tagItem = new ManagementPageTag(tag);
			let html = tagItem.render();
			html.style.animationDelay = (items * .01) + 's';
			this.HTML.tagListHolder.append(html);
			items++;
		}


		let tagItem = new AddManagementPageTag();
		let html = tagItem.render();
		html.style.animationDelay = (items * .01) + 's';
		this.HTML.tagListHolder.append(html);
	}
}













class ManagementPageTag extends TransactionTag {
	isSavingsTag = false;
	constructor({name, color, id, filter, isSavingsTag}) {
		super({name: name, color: color, id: id, filter: filter});
		this.isSavingsTag = isSavingsTag;
	}

	render() {
		let element = createElement('div', 'tagPanel');
		element.onclick = () => App.tagPage.open(this);
		element.innerHTML = `
			<div class='tagTitleHolder'></div>
			<div class='savingInfoHolder'></div>
		`;

		element.style.borderBottomColor = this.color.hex;
		element.children[0].append(super.render());


		let money = Math.round(this.totalExpenses * 100) / 100;
		if (this.isSavingsTag) setTextToElement(element.children[1], "Savings: " + formatMoneyString(money));
		return element;
	}
}

class AddManagementPageTag extends ManagementPageTag {
	constructor() {
		super({name: '', color: new Color('#ccc')});
	}

	render() {
		let html = super.render();
		html.classList.add('addTagPanel');
		html.innerHTML = `
			<div class='tagTitleHolder'>
				<div class='tag'>
					<div class="tagIndicator">+</div>
					<div class="tagNameHolder">Add Tag</div>
				</div>
			</div>
		`;
		html.onclick = async () => {
			let tag = await App.tagManagementPage.createTagPopup.open();
			if (!tag) return;
			TagManager.addTag(tag);
			App.tagManagementPage.open();
		}
		return html;
	}
}

