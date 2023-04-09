

const SideBar = new class {
	#HTML = {
		buttons: {
			budgetPage: $('#sideBar .budgetManagement')[0]
		}
	}
	constructor() {
	}
	async setup() {
		App.budgetManagementPage.close();
	}


	setBudgetPageWarning(_warning) {
		this.#HTML.buttons.budgetPage.classList.remove('warning');
		if (!_warning) return;
		this.#HTML.buttons.budgetPage.classList.add('warning');
	}
}
