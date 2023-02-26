

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
	#labelMargin = new Vector(30, 20);
	
	constructor(_input) {
		super(_input);
	}
	
	setData(_lines) {

		// Calculate the domains
		this.#xDomain = new Vector(Infinity, -Infinity);
		this.#yDomain = new Vector(0, 0);
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
		if (_line.data.length < 1) return;
		this._ctx.strokeStyle = _line.color.hex;
		this._ctx.strokeWidth = 2;
		this._ctx.beginPath();
	
		let prevCoord = this.#pointToCanvasCoord(_line.data[0]);
		for (let p = 1; p < _line.data.length; p++)
		{
			let coord = this.#pointToCanvasCoord(_line.data[p]);
			this._ctx.moveTo(prevCoord.value[0], prevCoord.value[1]);
			this._ctx.lineTo(coord.value[0], coord.value[1]);
			prevCoord = coord;
		}
		this._ctx.closePath();
		this._ctx.stroke();
	}


	#renderAxis() {
		const textColor = '#777';
		const axisColor = '#ddd';
		const backgroundAxisColor = '#eee';
		const axisThickness = 1;


		let topLeftCoord = this.#pointToCanvasCoord(new Vector(this.#xDomain.value[0], this.#yDomain.value[1]));
		let bottomLeftCoord = this.#pointToCanvasCoord(new Vector(this.#xDomain.value[0], this.#yDomain.value[0]));
		let middleLeftCoord = this.#pointToCanvasCoord(new Vector(this.#xDomain.value[0], 0));
		let middleRightCoord = this.#pointToCanvasCoord(new Vector(this.#xDomain.value[1], 0));


		// Y-Axis
		let pxdy = bottomLeftCoord.value[1] - topLeftCoord.value[1];
		let dy = this.#yDomain.value[1] - this.#yDomain.value[0];
		
		this._ctx.fillStyle = axisColor;
		this._ctx.fillRect(topLeftCoord.value[0], 0, axisThickness, dy);
		
		const yLabelCount = pxdy / 30;
		for (let l = 0; l < yLabelCount; l++)
		{
			let perc = l / yLabelCount;
			let yValue = Math.round(dy * (1 - perc) + this.#yDomain.value[0]);
			let yCoord = perc * pxdy;

			this._ctx.textBaseline = 'middle';
			this._ctx.textAlign = 'right';
			this._ctx.fillStyle = textColor;
			
			this._ctx.fillStyle = backgroundAxisColor;
			this._ctx.fillRect(this.#labelMargin.value[0], yCoord, this._HTML.canvas.width - this.#labelMargin.value[0], 1);
			this._ctx.fill();

			this._ctx.fillStyle = axisColor;
			this._ctx.fillRect(this.#labelMargin.value[0] - 5, yCoord, 5, 2);
			this._ctx.fill();

			this._ctx.fillStyle = textColor;
			this._ctx.fillText(yValue, this.#labelMargin.value[0] - 10, yCoord);
			this._ctx.fill();
		}




		// X-Axis
		let dx = this.#xDomain.value[1] - this.#xDomain.value[0];
		let pxdx = middleRightCoord.value[0] - middleLeftCoord.value[0];

		this._ctx.fillStyle = axisColor;
		this._ctx.fillRect(middleLeftCoord.value[0], middleLeftCoord.value[1], pxdx, axisThickness);

		const xLabelCount = pxdx / 80;
		for (let l = 0; l < xLabelCount; l++)
		{
			let perc = l / xLabelCount;
			this._ctx.textBaseline = 'bottom';
			this._ctx.textAlign = 'center';

			let pxX = perc * pxdx + this.#labelMargin.value[0];
			let x = Math.round(dx * (1 - perc) + this.#xDomain.value[0]);
			let label = x;
			if (x > 10000000) 
			{
				let date = new Date(x);
				label = date.getMonths()[date.getMonth()].name.substr(0, 3) + ' ' + date.getFullYear();
			}

			this._ctx.fillStyle = backgroundAxisColor;
			this._ctx.fillRect(pxX, 0, 1, this._HTML.canvas.height - this.#labelMargin.value[1]);
			this._ctx.fill();

			this._ctx.fillStyle = axisColor;
			this._ctx.fillRect(pxX, this._HTML.canvas.height - this.#labelMargin.value[1], 2, 5);
			this._ctx.fill();

			this._ctx.fillStyle = textColor;
			this._ctx.fillText(label, pxX, this._HTML.canvas.height);
			this._ctx.fill();
		}


		this._ctx.fill();
	}


	#pointToCanvasCoord(_coord) {
		let relCoord = new Vector(
			_coord.value[0] - this.#xDomain.value[0], 
			_coord.value[1] - this.#yDomain.value[0]
		).elementWiseProduct(this.#domainScalar);
		relCoord.value[1] = 1 - relCoord.value[1];

		return relCoord.elementWiseProduct(this._canvasSize.copy().subtract(this.#labelMargin)).add(new Vector(this.#labelMargin.value[0], 0));
	}

	get #domainScalar() {
		return new Vector(
			1 / (this.#xDomain.value[1] - this.#xDomain.value[0]),
			1 / (this.#yDomain.value[1] - this.#yDomain.value[0]),
		)
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
