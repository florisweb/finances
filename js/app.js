

const App = new class {
	curPage;
	statusMessage;

	constructor() {
		Object.assign(this, Pages);
		setTimeout(() => this.setup(), 1);
	}
	async setup() {
		this.statusMessage = new GlobalStatusMessage();

		await LocalDB.setup();
		await TransactionManager.setup();
		await TagManager.setup();
		await BudgetManager.setup();
		
		this.uploadCSVPage.open();
		if (TransactionManager.data.length) this.tagManagementPage.open();
	}
}


class GlobalStatusMessage extends UIStatusMessage {
	#textHolder;
	constructor() {
		let text = new UIText({text: 'text...'});
		super({content: [text]});
		this.#textHolder = text;
	}

	open(_text) {
		this.#textHolder.setText(_text);
		super.open();
		setTimeout(() => this.close(), 400 * _text.length);
	}
}