
BolScraper = new class {
	async scrape() {
		await this.loadAllContent();

		let items = [];
		let elements = document.querySelectorAll('.hit-area__link[title]');
		if (!elements.length) return false;
		let allElements = Object.assign([], elements[0].parentNode.parentNode.children);

		for (let element of elements)
		{
			let ownIndex = allElements.findIndex(el => el === element.parentNode);
			let item = {
				title: element.title,
			}
			for (let i = ownIndex; i >= 0; i--)
			{
				let curElement = allElements[i];
				if (!curElement.classList.contains('order-overview__header')) continue;
				item.date = curElement.children[0].innerHTML;
				break;
			}

			items.push(item);
		}

		return items;
	}

	async loadAllContent() {
		let element = document.querySelector('.js_order_overview_load_more_button');
		while (element)
		{
			element = document.querySelector('.js_order_overview_load_more_button');
			if (element) element.click();
			await wait(500);
		}
	}
}


async function wait(_ms) {
	return new Promise((resolve) => setTimeout(resolve, _ms));
}


data = await BolScraper.scrape();



