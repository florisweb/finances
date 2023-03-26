




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

		let filterBuilder = new UITagFilterBuilder();

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
				new UIVerticalSpacer({height: 30}),

				
				filterBuilder,

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
		this.#HTML.filterBuilder = filterBuilder;
	}

	#onSavingsTagCheckboxToggle() {
		this.#HTML.savingsTagStartMoneyInput.HTML.classList.remove('hide');
		if (this.#HTML.checkBox.checked) return;
		this.#HTML.savingsTagStartMoneyInput.HTML.classList.add('hide');
	}



	createTag() {
		if (this.#HTML.tagNameInput.value.length < 3) return alert('Please choose a longer name');
		this.#HTML.filterBuilder.setFilter(); // Clears the builder	

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

		this.#HTML.filterBuilder.setFilter([[["description", "includes", "maandelijkse leef- en studievergoeding"]],[["description", "includes", "zakgeld"], ["description", "includes", "maandelijkse leef- en studievergoeding"]]]);
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
		this.HTML.overview = {
			holder: $('.page.tagManagementPage > .overviewHolder')[0],
			totalBalance: $('.page.tagManagementPage > .overviewHolder .balanceHolder.total')[0],
			availableBalance: $('.page.tagManagementPage > .overviewHolder .balanceHolder.available')[0],
		}

		this.createTagPopup = new TagManagementPage_createTagPopup();
	}

	open() {
		super.open();
		this.render();

		setTextToElement(this.HTML.overview.totalBalance, formatMoneyString(BudgetManager.getBalance(), false));
		setTextToElement(this.HTML.overview.availableBalance, formatMoneyString(BudgetManager.getAvailableBalance(), false));
	}


	render() {
		this.HTML.tagListHolder.innerHTML = '';
		let items = 0;
		let tags = [...TagManager.savingTags, ...TagManager.normalTags];
		for (let tag of tags)
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













class ManagementPageTag extends SavingsTransactionTag {
	isSavingsTag = false;
	constructor({name, color, id, filter, isSavingsTag, startValue}) {
		super(...arguments);
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

		if (this.isSavingsTag) setTextToElement(element.children[1], "Savings: " + formatMoneyString(this.totalSavings));
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

