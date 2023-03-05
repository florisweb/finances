

const App = new class {
	curPage;
	constructor() {
		Object.assign(this, Pages);
		setTimeout(() => this.setup(), 1);
	}
	async setup() {
		await LocalDB.setup();
		await TransactionManager.setup();
		await TagManager.setup();
		
		this.uploadCSVPage.open();
		if (TransactionManager.data.length) this.tagManagementPage.open();
	}
}