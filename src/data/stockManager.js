
const StockManager = new class {
	#fetchUrl = 'backend/fetchStockInfo.php';

	#SymbolTable = {
		'ASN Duurzaam Mixfonds Zeer Offensief': 'ASNZO.AS',
		'ASN Duurzaam Mixfonds Offensief': 'ASNO.AS',
		'ASN Duurzaam Mixfonds Defensief': 'ASND.AS',
		'ASN Duurzaam Mixfonds Zeer Defensief': 'ASNZD.AS',
	}
	#cachedStocks = {};
	#cacheTTL = 1000 * 60 * 60 * 24;

	constructor() {
		window.StockManager = this;
	}

	async fetchStockHistory(_symbolOrName) {
		let symbol = this.#symbolOrNameToSymbol(_symbolOrName);
		if (this.#cachedStocks[symbol] && new Date() - this.#cachedStocks[symbol].cacheDate < this.#cacheTTL) return this.#cachedStocks[symbol].data;
		let response = await this.#fetchRequest(this.#fetchUrl + '?symbol=' + symbol);
		if (response.error) return response;
		let rawData = response.chart.result[0];

		let data = rawData.timestamp.map((t, i) => {
			return {
				time: new Date(t * 1000), 
				stockPrice: rawData.indicators.adjclose[0].adjclose[i]}
			}
		).filter(r => typeof r.stockPrice === 'number');
		data.sort((a, b) => a.time < b.time);
		this.#cachedStocks[symbol] = {data: data, cacheDate: new Date()};
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