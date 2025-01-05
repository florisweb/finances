<script>	
    import { MonthIdentifier } from '../types';
	import Vector from '../vector';

	export let title = '';
	export let data = [{
		title: 'test',
		data: []
	}];

	export let customClass = '';
	export let maxWidth = Infinity;
	export let maxheight = Infinity;
	export let config = {};
	$: config = {
		enablePointInfoPopup: true,
		renderLabels: true,
		...config
	};


	// Data: 
	/*[
		{
			data: [vector, vector...]
		}
	]
	*/




	let canvas;
	let ctx;
	$: {
		ctx = canvas?.getContext('2d');
		if (ctx)
		{
			ctx.drawCircle = (x, y, radius) => {
				ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
			}
			render();
		}	
	}

	$: {
		if (canvas) {
			onResize();

			canvas.addEventListener('mousedown', handleDragStart);
			window.addEventListener('mouseup', handleDragEnd);
			canvas.addEventListener('mousemove', handleDragMove);
		}
	}

	let canvasSize = new Vector(500, 500);

	let xDomain = new Vector(0, 0); // min, max
	let yDomain = new Vector(0, 0);


	let prevData = '';
	$: {
		if (data) {
			if (JSON.stringify(data) !== prevData)
			{
				prevData = JSON.stringify(data);
				calcDomains();
				if (ctx) render();
			}
		}
	}


	// Interface for user
	let curHoverPoint = false;
	
	let dragging = false;
	let prevDragPos = new Vector(0, 0);
	function handleDragStart(_e) {
		dragging = true;
		prevDragPos = Camera.pxToWorldCoord(Camera.eventToPxCoord(_e), true);
	}

	function handleDragMove(_e) {
		if (!dragging) return handleMouseMove(_e);
		let dragPos = Camera.pxToWorldCoord(Camera.eventToPxCoord(_e), true);
		let delta = prevDragPos.copy().subtract(dragPos);
		prevDragPos = dragPos;

		Camera.position.add(new Vector(delta.value[0], 0));
		if (Camera.position.value[0] < xDomain.value[0]) Camera.position.value[0] = xDomain.value[0];
		if (Camera.position.value[0] + Camera.size.value[0] > xDomain.value[1]) Camera.position.value[0] = xDomain.value[1] - Camera.size.value[0];
		render();
	}

	function handleDragEnd(_e) {
		dragging = false;
	}

	function handleMouseMove(_e) {
		if (!config.enablePointInfoPopup) return;
		let dragPos = Camera.eventToPxCoord(_e);

		let points = [];
		for (let line of data)
		{
			for (let point of line.data)
			{
				let pos = Camera.worldToPxCoord(point);
				let distance = pos.difference(dragPos).getSquaredLength();
				if (distance > 20**2) continue;
				points.push({
					distance: distance,
					line: line,
					point: point,
				})
			}
		}
		
		if (!points.length) {
			if (curHoverPoint) {
				curHoverPoint = false; 
				render();
			}
			return;
		}

		points.sort((a, b) => a.distance > b.distance);
		if (curHoverPoint === points[0]) return;
		curHoverPoint = points[0];
		render();
	}
	















	function calcDomains() {
		yDomain = new Vector(0, -Infinity);
		xDomain = new Vector(0, data.length);
		for (let bar of data)
		{
			let sum = bar.data.map(r => r.value).reduce((a, b) => a + b, 0);
			if (sum > yDomain.value[1]) yDomain.value[1] = sum;
		}
		
		yDomain.value[1] *= 1.1; // Add some overhead margin

		Camera.size.value = [
			Math.min(Math.floor(canvasSize.value[0] / minBarWidth), data.length),
			Math.min(yDomain.value[1] - yDomain.value[0], maxheight)
		];
		console.log('size',canvasSize.value[0] / minBarWidth, minBarWidth*data.length);
		
		Camera.position.value = [
			xDomain.value[1] - Camera.size.value[0],
			Camera.size.value[1],
		];
	}



	const textColor = '#777';
	const axisColor = '#ccc';
	const backgroundAxisColor = '#eee';
	const axisThickness = 1;
	const xMargin = 10;
	const minBarWidth = 40;
	
	function render() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		renderYAxis();
		renderXAxis();

		for (let i = Math.floor(Camera.position.value[0]); i < Math.min(data.length, Camera.position.value[0] + Camera.size.value[0]); i++) renderBar(data[i], i);

		// if (!curHoverPoint) return;
		// renderPointInfo(curHoverPoint);
	}


	function renderPointInfo(_point) {
		const boxSize = new Vector(40, 15);
		const dotRadius = 5;
		let coord = Camera.worldToPxCoord(_point.point);

		ctx.fillStyle = _point.line.color.hex;
		ctx.strokeStyle = '#eee';
		ctx.beginPath();
		ctx.drawCircle(coord.value[0], coord.value[1], dotRadius);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		let boxPos = coord.copy().subtract(new Vector(boxSize.value[0] / 2, boxSize.value[1] + dotRadius));
		ctx.fillStyle = '#fff';
		ctx.strokeStyle = _point.line.color.hex;
		ctx.beginPath();
		ctx.rect(boxPos.value[0], boxPos.value[1], boxSize.value[0], boxSize.value[1]);
		ctx.closePath();
		ctx.stroke();
		ctx.fill();

		ctx.fillStyle = _point.line.color.hex;
		ctx.beginPath();
		ctx.fillText(Math.round(_point.point.value[1]), boxPos.value[0] + boxSize.value[0] / 2, boxPos.value[1]);
		ctx.closePath();
		ctx.fill();
	}


	
	function renderBar(_bar, _barIndex) {		
		let prevY = 0;
		for (let b = 0; b < _bar.data.length; b++)
		{
			let beginCoord = Camera.worldToPxCoord(new Vector(_barIndex, prevY + _bar.data[b].value));
			let delta = beginCoord.difference(Camera.worldToPxCoord(new Vector(_barIndex + 1, prevY)));

			ctx.fillStyle = _bar.data[b].color;
			ctx.beginPath();
			ctx.fillRect(beginCoord.value[0] - xMargin / 2, beginCoord.value[1], delta.value[0] - xMargin, delta.value[1] - 1)
			ctx.closePath();
			ctx.fill();

			prevY += _bar.data[b].value;	
		}
	}

	function renderXAxis() {
		ctx.clearRect(0, canvas.height - Camera.labelMargin.value[1], canvas.width, Camera.labelMargin.value[1]);

		ctx.fillStyle = axisColor;
		ctx.fillRect(0, canvas.height - Camera.labelMargin.value[1], canvas.width, axisThickness);
		ctx.fill();
		
		for (let x = Math.floor(Camera.position.value[0]); x < Math.min(Camera.position.value[0] + Camera.size.value[0], data.length); x++)
		{
			let coord = Camera.worldToPxCoord(new Vector(x , 0));
			renderXLabel(data[x].title, coord);
		}
	}

	function renderXLabel(_label, _coord) {
		ctx.textBaseline = 'top';
		ctx.textAlign = 'center';
		if (!config.renderLabels) return;

		ctx.fillStyle = textColor;
		ctx.fillText(_label, _coord.value[0], canvas.height - Camera.labelMargin.value[1] + 5);
		ctx.fill();
	}

	function renderYAxis() {
		ctx.clearRect(0, 0, Camera.labelMargin.value[0], canvas.height);

		// Y-Axis
		let dy = yDomain.value[1] - yDomain.value[0];
		
		ctx.fillStyle = axisColor;
		ctx.fillRect(Camera.labelMargin.value[0], 0, axisThickness, dy);
		
		const yLabelCount = canvas.height / 50;
		let stepSize = Camera.size.value[1] / yLabelCount;
		let stepOrder = 0.25 * 10**(String(stepSize).split('.')[0].length);

		let startVal = Math.floor((Camera.position.value[1] - Camera.size.value[1]) / stepOrder) * stepOrder;
		for (let y = startVal; y < Camera.position.value[1] + stepOrder; y += stepOrder)
		{
			let coord = Camera.worldToPxCoord(new Vector(xDomain.value[0], y));
			
			ctx.textBaseline = 'middle';
			ctx.textAlign = 'right';
			ctx.fillStyle = textColor;
			
			ctx.fillStyle = backgroundAxisColor;
			ctx.fillRect(0, coord.value[1], canvas.width, 1);
			ctx.fill();
			if (!config.renderLabels) continue;

			ctx.fillStyle = axisColor;
			ctx.fillRect(Camera.labelMargin.value[0] - 5, coord.value[1], 5, 2);
			ctx.fill();

			ctx.fillStyle = textColor;
			ctx.fillText(Math.round(y), Camera.labelMargin.value[0] - 5, coord.value[1]);
			ctx.fill();
		}
	}





	
	const Camera = new class {
		position = new Vector(0, 0);
		size = new Vector(200, 200);
		#labelMargin = new Vector(45, 20);
		get labelMargin() {
			if (config.renderLabels) return this.#labelMargin;
			return new Vector(0, 0);
		}
		
		// World:
		// /\ - size
		// pos ---> size

		worldToPxCoord(_coord, _absolute = false) {
			return new Vector(
				(_coord.value[0] - this.position.value[0] * (!_absolute)) / this.size.value[0] * (canvas.width - this.labelMargin.value[0]) + this.labelMargin.value[0],
				-(_coord.value[1] - this.position.value[1] * (!_absolute)) / this.size.value[1] * (canvas.height - this.labelMargin.value[1]),
			);
		}
		
		pxToWorldCoord(_coord, _absolute = false) {
			return new Vector(
				(_coord.value[0] - this.labelMargin.value[0]) / (canvas.width - this.labelMargin.value[0]) * this.size.value[0] + this.position.value[0] * (!_absolute),
				-_coord.value[1] / (canvas.height - this.labelMargin.value[1]) * this.size.value[1] - this.position.value[1] * (!_absolute)
			);
		}

		eventToPxCoord(_e) { // px-coord = pixel of canvas
			return new Vector(
				_e.offsetX / canvas.offsetWidth * canvas.width,
				_e.offsetY / canvas.offsetHeight * canvas.height,
			);
		}	
	}

	window.c = Camera;
	





	function eventToCanvasCoord(_e) {
		return new Vector(
			_e.offsetX / canvas.offsetWidth * canvas.width,
			_e.offsetY / canvas.offsetHeight * canvas.height,
		);
	}


	window.addEventListener('resize', () => onResize())
	function onResize() {
		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;

		canvasSize = new Vector(
			canvas.offsetWidth,
			canvas.offsetHeight
		);
	}
</script>

<div class={'GraphHolder ' + customClass || ''}>
	<div class='titleHolder'>{title}</div>
	<canvas bind:this={canvas} width="1000" height="300"></canvas>
</div>



<style>
	.GraphHolder {
		position: relative;
		width: 100%;
		height: 100%;
		border: 1px solid #eee;
		box-shadow: 5px 5px 20px 20px rgba(0, 0, 0, .01);
	}
	.titleHolder {
		position: absolute;
		left: 0;
		top: 0;
		margin-left: 20px;
		margin-top: 10px;
		pointer-events: none;
	}
	canvas {
		position: relative;
		width: 100%;
		height: 100%;
	}
</style>