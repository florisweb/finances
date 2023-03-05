




class TagManagementPage_createTagPopup extends Popup {
	#openPromiseResolver;
	#HTML = {};
	constructor() {
		let input = new UIInput({placeholder: "Tag Name...", onChange: () => console.log('hey')});
		let dropDown = new DropDown({});

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
				new UITitle({title: 'Create Tag'}),
				new UIVerticalSpacer({height: 20}),
				input,
				new UIVerticalSpacer({height: 20}),
				dropDown,
				new UIVerticalSpacer({height: 80}),
				new UIHorizontalSegment({content: [
					new UIButton({text: 'Add', customClass: 'alignRight', filled: true, onclick: () => this.createTag()}),
					new UIButton({text: 'Cancel', customClass: 'alignRight', onclick: () => this.close()}),
				]})
			],
			customClass: "createTagPopup"
		})
		this.#HTML.input = input;
		this.#HTML.dropDown = dropDown;
	}



	createTag() {
		if (this.#HTML.input.value.length < 3) return alert('Please choose a longer name');
		let tag = new TransactionTag({id: TagManager.getNewTagId(), name: this.#HTML.input.value, color: this.#HTML.dropDown.value});
		this.#openPromiseResolver(tag);
		return this.close();
	}

	open() {
		super.open();
		this.#HTML.input.value = null;
		return new Promise((resolver) => this.#openPromiseResolver = resolver);
	}

	close() {
		super.close();
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

