

const App = new class {
	curPage;
	constructor() {
		Object.assign(this, Pages);
		setTimeout(() => this.setup(), 1);
	}
	setup() {
		this.uploadCSVPage.open();
		// if (DataManager.transactions.length) this.transactionListViewerPage.open(DataManager.transactions);
		if (DataManager.transactions.length) this.tagManagementPage.open();

	}
}