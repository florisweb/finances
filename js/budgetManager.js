


const BudgetManager = new class {
	
	async setup() {

	}


	getBalance() {
		TransactionManager.data.sort((a, b) => new Date().fromString(a.date) > new Date().fromString(b.date));
		let lastTransaction = TransactionManager.data[TransactionManager.data.length - 1];
		if (!lastTransaction) return 0;
		return lastTransaction.balance + lastTransaction.deltaMoney;
	}

	getAvailableBalance() {
		let savedMoney = 0;
		for (let tag of TagManager.savingTags) savedMoney += tag.totalSavings;
		return this.getBalance() - savedMoney;
	}


	getPaymentDeficits() {
		let totalMonths = {};
		for (let tag of TagManager.data)
		{
			let months = tag.getPaymentDeficits();
			for (let key in months)
			{
				if (!totalMonths[key]) totalMonths[key] = 0;
				totalMonths[key] += months[key];
			}
		}
		return totalMonths;
	}

	getBudgets() {
		let totalMonths = {};
		for (let tag of TagManager.data)
		{
			let months = tag.expensesBudget;
			for (let key in months)
			{
				if (!totalMonths[key]) totalMonths[key] = 0;
				totalMonths[key] += months[key];
			}
		}
		return totalMonths;
	}
}