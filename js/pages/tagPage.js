

new class TagPage extends Page {
	HTML = {};
	table;
	#curTag;
	constructor() {
		super({pageIndex: 5});
		this.HTML.pageHeader = $('.tagPage .pageHeader')[0];
		this.HTML.pageTitleHolder = $('.tagPage .pageHeader .titleHolder')[0];

		this.HTML.tagContentHolder = $('.tagPage .tagContentHolder')[0];

	
 		// Header
		this.HTML.removeButton = new UIButton({text: 'Remove', customClass: 'alignRight removeButton',  filled: true,  onclick: async () => {
			await TagManager.removeTag(this.#curTag);
			App.tagManagementPage.open();
		}});
		this.HTML.editButton = new UIButton({text: 'Edit', customClass: 'alignRight', filled: true, onclick: async () => {
			let tag = await App.tagManagementPage.createTagPopup.openEdit(this.#curTag);
			if (!tag) return;
			await TagManager.addTag(tag);
			TransactionManager.autoClassifyTransactions();
			this.open(tag);
		}});
		this.HTML.pageHeader.append(this.HTML.removeButton.HTML);
		this.HTML.pageHeader.append(this.HTML.editButton.HTML);


		// Content

		this.expensesGraph = new UILineGraph({title: 'Income'});
		this.expensesGraph.HTML.classList.add('expensesGraph');
		this.HTML.tagContentHolder.append(this.expensesGraph.HTML);

		this.transactionTable = new InfiniteScrollTransactionTable({
			customClass: 'transactionTable',
			badgeSize: 1,
		});
		this.HTML.tagContentHolder.append(this.transactionTable.HTML);
	}

	open(_tag) {
		if (!_tag) return;
		this.#curTag = _tag;
		super.open();
		setTextToElement(this.HTML.pageTitleHolder, _tag.name);

		let transactions = _tag.transactions;
		this.transactionTable.setTransactions(transactions);
		this.transactionTable.showTransactions();

		let expensesMap = new Map();
		let incomeMap = new Map();
		for (let t of transactions)
		{
			let date = new Date().setDateFromStr(t.date);
			let id = '1-' + date.getMonth() + '-' + date.getFullYear();
				
			if (t.deltaMoney < 0)
			{
				let output = expensesMap.get(id);
				if (!output) output = 0;
				output += -t.deltaMoney;
				expensesMap.set(id, output);
			} else {
				let output = incomeMap.get(id);
				if (!output) output = 0;
				output += t.deltaMoney;
				incomeMap.set(id, output);
			}
		}

		let expenses = [];
		for (let [date, money] of expensesMap)
		{
			expenses.push(new Vector(new Date().setDateFromStr(date).getTime(), money));	
		}
		let incomes = [];
		for (let [date, money] of incomeMap)
		{
			incomes.push(new Vector(new Date().setDateFromStr(date).getTime(), money));	
		}



		this.expensesGraph.setData([
			new LineGraphLineData({
				label: 'Expenses', 
				color: new Color('#f00'),
				data: expenses,
				doNotInterpolate: true,
			}),
			new LineGraphLineData({
				label: 'Income', 
				color: new Color('#0f0'),
				data: incomes,
				doNotInterpolate: true,
			})
		]);
	

		this.render();
	}


	render() {
		this.expensesGraph.render()
		// this.HTML.tagListHolder.innerHTML = '';

	}

}
