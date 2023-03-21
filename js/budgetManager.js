


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
		let assignedMoney = 0;
		for (let tag of TagManager.actualData) assignedMoney += tag.totalExpenses;
		return this.getBalance() - assignedMoney;
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