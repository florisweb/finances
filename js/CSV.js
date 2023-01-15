

class CSVFileManager {
	#CSVTemplate = [];
	rows = [];

	constructor(_CSVTemplate = []) {
		this.#CSVTemplate = _CSVTemplate;
	}

	async load(_file) {
		return new Promise((resolve, error) => {
			if (!_file) return error();

			const reader = new FileReader();
		  	reader.onload = async () => {
		    	const text = reader.result;
		    	let rows = text.split('\n');
		    	this.rows = rows.map((string) => new CSVRow(string.split(','), this.#CSVTemplate));
		    	resolve(this.rows);
		  	}
		  
		  	reader.readAsText(_file)
		});
	}

	toCSV(_template = this.#CSVTemplate) {
		let rows = this.rows.map((_row) => _row.toCSV(_template));
		return rows.join('\n');
	}
}



class CSVRow {
	#CSVTemplate = [];
	constructor(_valueArr, _CSVTemplate = []) {
		this.#CSVTemplate = _CSVTemplate;
		for (let i = 0; i < _CSVTemplate.length; i++)
		{
			this[_CSVTemplate[i]] = _valueArr[i];
		}
	}


	toCSV(_template = this.#CSVTemplate) {
		let output = [];
		for (let i = 0; i < _template.length; i++)
		{
			output[i] = this[_template[i]];
		}
		return output;
	}
}



function downloadCSV(_string) {
	var c = document.createElement("a");
	c.download = "output.csv";

	var t = new Blob([_string], {
		type: "text/csv"
	});
	c.href = window.URL.createObjectURL(t);
	c.click();
}