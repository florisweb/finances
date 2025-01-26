
const StockManager = new class {
	#fetchUrl = 'backend/fetchStockInfo.php';

	#SymbolTable = {
		'ASN Duurzaam Mixfonds Zeer Offensief': 'ASNZO.AS',
		'ASN Duurzaam Mixfonds Offensief': 'ASNO.AS',
		'ASN Duurzaam Mixfonds Defensief': 'ASND.AS',
		'ASN Duurzaam Mixfonds Zeer Defensief': 'ASNZD.AS',
	}

	constructor() {
		window.StockManager = this;
	}

	async fetchStockHistory(_symbolOrName) {
		let response = await this.#fetchRequest(this.#fetchUrl + '?symbol=' + this.#symbolOrNameToSymbol(_symbolOrName));
		if (response.error) return response;
		let rawData = response.chart.result[0];

		let data = rawData.timestamp.map((t, i) => {
			return {
				time: new Date(t * 1000), 
				stockPrice: rawData.indicators.adjclose[0].adjclose[i]}
			}
		).filter(r => typeof r.stockPrice === 'number');
		data.sort((a, b) => a.time < b.time);
		return data;
	}

	#symbolOrNameToSymbol(_symbol) {
		return this.#SymbolTable[_symbol] || _symbol;
	}


	async #fetchRequest(_url) {
		return new Promise((resolve) => {
			fetch(_url).then(async (_response) => {
				try {
					resolve(await _response.json());
				} catch (e) {resolve({error: e})}
			}, (e) => resolve({error: e}));
		})
	}


}

export default StockManager;