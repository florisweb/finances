

class UIBaseGraph {
	_HTML = {};
	_data = [];
	title = '';
	_ctx;

	set title(_title) {
		this.title = _title;
		if (!this._HTML.titleHolder) return;
		setTextToElement(this._HTML.titleHolder, this.title);
	}
	constructor({title}) {
		this.title = title;
		this._HTML.self = createElement('div', 'graphHolder');
		this._HTML.self.innerHTML = `
			<div class='titleHolder'></div>
			<canvas class='dataCanvas'></canvas>
		`;

		this._HTML.titleHolder = this._HTML.self.children[0];
		this._HTML.canvas = this._HTML.self.children[1];
		this._ctx = this._HTML.canvas.getContext('2d');
		this.title = this.title; // calls the setter


		window.addEventListener('resize', () => this._onResize())
	}

	setData(_data) {
		this._data = _data;
	}

	get HTML() {
		setTimeout(() => this._onResize(), 1);
		return this._HTML.self;
	}

	_drawPoint(_pxPos, _colorString = '#f00') {
		this._ctx.fillStyle = _colorString;
		this._ctx.fillRect(_pxPos.value[0], _pxPos.value[1], 5, 5);
		this._ctx.fill();
	}

	_onResize() {
		this._HTML.canvas.width = this._HTML.canvas.offsetWidth;
		this._HTML.canvas.height = this._HTML.canvas.offsetHeight;

		this._canvasSize = new Vector(
			this._HTML.canvas.offsetWidth,
			this._HTML.canvas.offsetHeight
		);
	}
}

class UIPieChart extends UIBaseGraph {
	get HTML() {
		let html = super.HTML;
		return html;
	}
}



class UILineGraph extends UIBaseGraph {
	#xDomain = new Vector(0, 0); // min, max
	#yDomain = new Vector(0, 0);
	_canvasSize = new Vector(500, 500);
	
	constructor(_input) {
		super(_input);
	}
	
	setData(_lines) {

		// Calculate the domains
		this.#xDomain = new Vector(Infinity, -Infinity);
		this.#yDomain = new Vector(Infinity, -Infinity);
		for (let line of _lines)
		{
			for (let point of line.data)
			{
				if (point.value[0] < this.#xDomain.value[0]) this.#xDomain.value[0] = point.value[0];
				if (point.value[0] > this.#xDomain.value[1]) this.#xDomain.value[1] = point.value[0];
				if (point.value[1] < this.#yDomain.value[0]) this.#yDomain.value[0] = point.value[1];
				if (point.value[1] > this.#yDomain.value[1]) this.#yDomain.value[1] = point.value[1];
			}
		}

		super.setData(_lines);
		this.render();
	}


	render() {
		this._ctx.clearRect(0, 0, this._HTML.canvas.width, this._HTML.canvas.height);
		this.#renderAxis();

		for (let line of this._data) this.#renderLine(line);
	}
	
	#renderLine(_line) {
		console.log('render', _line);
		for (let point of _line.data)
		{
			let coord = this.#pointToCanvasCoord(point);
			this._drawPoint(coord, _line.color.hex);
		}
	}


	#renderAxis() {

	}


	#pointToCanvasCoord(_coord) {
		let relCoord = new Vector(
			_coord.value[0] - this.#xDomain.value[0], 
			_coord.value[1] - this.#yDomain.value[0]
		).elementWiseProduct(new Vector(
			1 / (this.#xDomain.value[1] - this.#xDomain.value[0]),
			1 / (this.#yDomain.value[1] - this.#yDomain.value[0]),
		));
		relCoord.value[1] = 1 - relCoord.value[1];

		return relCoord.elementWiseProduct(this._canvasSize);
	}


	_onResize() {
		super._onResize();
		this.render();
	}
}


















class GraphDataPoint {
	label = '';
	data;
	color;
	constructor({label, color, data}) {
		this.label = label;
		this.data = data;
		this.color = color;
	}
}

class PieChartDataPoint extends GraphDataPoint {
	data = 0;
	constructor(_input) {
		_input.data = parseFloat(_input.data);
		super(_input);
	}
}



class LineGraphLineData {
	label = '';
	data;
	color = new Color('#f00');
	constructor({label, data, color}) {
		this.label = label;
		this.data = data;
		this.color = color;
	}
}
