<script>	
	import Vector from '../vector';

	export let title = 'Graph';
	export let data = [{data: []}];
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
		if (ctx) render();
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
				console.warn('data changed');
				prevData = JSON.stringify(data);
				calcDomains();
				if (ctx) render();
			}
		}
	}



	// DRAGGER
	let dragging = false;
	let prevDragPos = new Vector(0, 0);
	function handleDragStart(_e) {
		dragging = true;
		prevDragPos = Camera.pxToWorldCoord(Camera.eventToPxCoord(_e), true);
	}

	function handleDragMove(_e) {
		if (!dragging) return;
		let dragPos = Camera.pxToWorldCoord(Camera.eventToPxCoord(_e), true);
		let delta = prevDragPos.copy().subtract(dragPos);
		prevDragPos = dragPos;

		Camera.position.add(delta);
		if (Camera.position.value[0] < xDomain.value[0]) Camera.position.value[0] = xDomain.value[0];
		if (Camera.position.value[0] + Camera.size.value[0] > xDomain.value[1]) Camera.position.value[0] = xDomain.value[1] - Camera.size.value[0];
		if (Camera.position.value[1] > yDomain.value[1]) Camera.position.value[1] = yDomain.value[1];
		if (Camera.position.value[1] - Camera.size.value[1] < yDomain.value[0]) Camera.position.value[1] = yDomain.value[0] + Camera.size.value[1];
		render();
	}

	function handleDragEnd(_e) {
		dragging = false;
	}
	















	function calcDomains() {
		xDomain = new Vector(Infinity, -Infinity);
		yDomain = new Vector(0, -Infinity);
		for (let line of data)
		{
			for (let point of line.data)
			{
				if (point.value[0] < xDomain.value[0]) xDomain.value[0] = point.value[0];
				if (point.value[0] > xDomain.value[1]) xDomain.value[1] = point.value[0];
				if (point.value[1] < yDomain.value[0]) yDomain.value[0] = point.value[1];
				if (point.value[1] > yDomain.value[1]) yDomain.value[1] = point.value[1];
			}
		}

		console.info('domains', xDomain.value, yDomain.value, data);

		Camera.size.value = [
			(xDomain.value[1] - xDomain.value[0]), 
			(yDomain.value[1] - yDomain.value[0])
		];
		
		Camera.position.value = [
			xDomain.value[0],
			yDomain.value[0] + Camera.size.value[1],
		];
	}
	
	function render() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		for (let line of data) renderLine(line);
		renderYAxis();
		renderXAxis();
	}


	
	function renderLine(_line) {
		if (_line.data.length < 1) return;
		ctx.strokeStyle = _line.color.hex;
		ctx.strokeWidth = 2;
		ctx.beginPath();

		_line.data.sort((a, b) => a.value[0] > b.value[0]);
	
		let prevCoord = Camera.worldToPxCoord(_line.data[0]);
		for (let p = 1; p < _line.data.length; p++)
		{
			let coord = Camera.worldToPxCoord(_line.data[p]);

			ctx.moveTo(prevCoord.value[0], prevCoord.value[1]);
			if (_line.doNotInterpolate)
			{
				ctx.lineTo(coord.value[0], prevCoord.value[1]);
				ctx.moveTo(coord.value[0], prevCoord.value[1]);
			}
			ctx.lineTo(coord.value[0], coord.value[1]);
			prevCoord = coord;
		}
		ctx.closePath();
		ctx.stroke();
	}

	function renderXAxis() {
		const textColor = '#777';
		const axisColor = '#ccc';
		const backgroundAxisColor = '#eee';
		const axisThickness = 1;
		
		ctx.clearRect(0, canvas.height - Camera.labelMargin.value[1], canvas.width, Camera.labelMargin.value[1]);

		ctx.fillStyle = axisColor;
		ctx.fillRect(0, canvas.height - Camera.labelMargin.value[1], canvas.width, axisThickness);
		ctx.fill();
		
		const xLabelCount = canvas.width / 100;
		let stepSize = Camera.size.value[0] / xLabelCount;
		let stepOrder = 0.25 * 10**(String(stepSize).split('.')[0].length);

		let startVal = Math.floor(Camera.position.value[0] / stepOrder) * stepOrder;
		for (let x = startVal; x < Camera.position.value[0] + Camera.size.value[0] + stepOrder; x += stepOrder)
		{
			let coord = Camera.worldToPxCoord(new Vector(x, 0));
			ctx.textBaseline = 'top';
			ctx.textAlign = 'center';

			let label = x;
			if (x > 10000000) 
			{
				let date = new Date(x);
				label = date.getMonths()[date.getMonth()].name.substr(0, 3) + ' ' + date.getFullYear();
			}

			// Vertical axis
			if (coord.value[0] >= Camera.labelMargin.value[0])
			{
				ctx.fillStyle = backgroundAxisColor;
				ctx.fillRect(coord.value[0], 0, 1, canvas.height);
				ctx.fill();
			}

			// Little extenders
			ctx.fillStyle = axisColor;
			ctx.fillRect(coord.value[0], canvas.height - Camera.labelMargin.value[1], 2, 5);
			ctx.fill();

			ctx.fillStyle = textColor;
			ctx.fillText(label, coord.value[0], canvas.height - Camera.labelMargin.value[1] + 5);
			ctx.fill();
		}
	}

	function renderYAxis() {
		const textColor = '#777';
		const axisColor = '#ddd';
		const backgroundAxisColor = '#eee';
		const axisThickness = 1;
		
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
		labelMargin = new Vector(40, 20);
		
		// World:
		// /\ - size
		// pos ---> size

		worldToPxCoord(_coord, _absolute = false) {
			return new Vector(
				(_coord.value[0] - this.position.value[0] * (!_absolute)) / this.size.value[0] * (canvas.width - this.labelMargin.value[0]) + this.labelMargin.value[0],
				-(_coord.value[1] - this.position.value[1] * (!_absolute)) / this.size.value[1] * (canvas.height - this.labelMargin.value[1]) + this.labelMargin.value[1],
			);
		}
		
		pxToWorldCoord(_coord, _absolute = false) {
			return new Vector(
				(_coord.value[0] - this.labelMargin.value[0]) / (canvas.width - this.labelMargin.value[0]) * this.size.value[0] + this.position.value[0] * (!_absolute),
				-(_coord.value[1] - this.labelMargin.value[1]) / (canvas.height - this.labelMargin.value[1]) * this.size.value[1] - this.position.value[1] * (!_absolute)
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

<div class='GraphHolder'>
	<div class='titleHolder'>{title}</div>
	<canvas bind:this={canvas} width="1000" height="300"></canvas>
</div>



<style>
	canvas {
		position: relative;
		width: 100%;
		height: 100%;
		padding: 10px;
		border: 1px solid red;
	}
</style>