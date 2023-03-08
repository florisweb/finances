




class TagManagementPage_createTagPopup extends Popup {
	#openPromiseResolver;
	#HTML = {};
	#curEditTag = {};
	constructor() {
		let titleHolder = new UITitle({title: 'Create Tag'});
		let tagNameInput = new UIInput({placeholder: "Tag Name..."});
		let savingsTagStartMoneyInput = new UIMoneyInput({placeholder: "Start money", canBeNegative: true});

		let dropDown = new DropDown({});
		let checkBox = new UICheckbox({text: 'Is Savings tag', onChange: () => this.#onSavingsTagCheckboxToggle()});
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
				tagNameInput,
				new UIVerticalSpacer({height: 20}),
				dropDown,
				new UIVerticalSpacer({height: 10}),
				checkBox,
				new UIVerticalSpacer({height: 10}),
				savingsTagStartMoneyInput,

				new UIVerticalSpacer({height: 80}),
				new UIHorizontalSegment({content: [
					addButton,
					new UIButton({text: 'Cancel', customClass: 'alignRight', onclick: () => this.close()})
				]})
			],
			customClass: "createTagPopup"
		})
		this.#HTML.tagNameInput = tagNameInput;
		this.#HTML.savingsTagStartMoneyInput = savingsTagStartMoneyInput;
		this.#HTML.dropDown = dropDown;
		this.#HTML.titleHolder = titleHolder;
		this.#HTML.addButton = addButton;
		this.#HTML.checkBox = checkBox;
	}

	#onSavingsTagCheckboxToggle() {
		this.#HTML.savingsTagStartMoneyInput.HTML.classList.remove('hide');
		if (this.#HTML.checkBox.checked) return;
		this.#HTML.savingsTagStartMoneyInput.HTML.classList.add('hide');
	}



	createTag() {
		if (this.#HTML.tagNameInput.value.length < 3) return alert('Please choose a longer name');
		
		if (typeof this.#curEditTag.id != 'number') this.#curEditTag.id = TagManager.getNewTagId();
		this.#curEditTag.name = this.#HTML.tagNameInput.value;
		this.#curEditTag.color = this.#HTML.dropDown.value;
		this.#curEditTag.startValue = parseFloat(this.#HTML.savingsTagStartMoneyInput.value);

		let constructor = this.#HTML.checkBox.checked ? SavingsTransactionTag : TransactionTag;
		let tag = new constructor(this.#curEditTag);
		this.#openPromiseResolver(tag);
		return this.close();
	}

	open() {
		this.#curEditTag = {};
		this.#HTML.titleHolder.setTitle('Create Tag');
		this.#HTML.addButton.setText('Add');
		super.open();
		this.#HTML.tagNameInput.value = null;
		this.#HTML.tagNameInput.focus();

		this.#HTML.savingsTagStartMoneyInput.value = null;

		return new Promise((resolver) => this.#openPromiseResolver = resolver);
	}

	openEdit(_tag) {
		let promise = this.open();
		this.#curEditTag = _tag;

		this.#HTML.titleHolder.setTitle('Edit Tag');
		this.#HTML.addButton.setText('Save');

		this.#HTML.tagNameInput.value = _tag.name;
		this.#HTML.checkBox.checked = _tag.isSavingsTag;
		if (_tag.isSavingsTag) this.#HTML.savingsTagStartMoneyInput.value = _tag.startValue;

		this.#HTML.dropDown.selectOption(_tag.color, true, (a, b) => a.hex === b.hex);

		return promise; 
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
	constructor({name, color, id, filter, isSavingsTag, startValue}) {
		super({name: name, color: color, id: id, filter: filter});
		this.isSavingsTag = isSavingsTag;
		this.startValue = startValue;
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

