const Pages = {};

class Page {
	#pageIndex;
	constructor({pageIndex}) {
		this.#pageIndex = pageIndex;
		let pageName = this.constructor.name.substr(0, 1).toLocaleLowerCase() + this.constructor.name.substr(1, this.constructor.name.length);
		Pages[pageName] = this;
	}

	get openState() {
		return App.openState === this;
	}

	open() {
		let pages = document.querySelectorAll('#mainContent .page');
		App.curPage = this;
		for (let page of pages) page.classList.add('hide');
		pages[this.#pageIndex].classList.remove('hide');
	}
}


new class TransactionListViewerPage extends Page {
	constructor() {
		super({pageIndex: 0});
	}
}

new class MonthOverViewPage extends Page {
	constructor() {
		super({pageIndex: 1});
	}

}