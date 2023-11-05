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
	$: if (canvas) onResize();



	let xDomain = new Vector(0, 0); // min, max
	let yDomain = new Vector(0, 0);
	let domainScalar = new Vector(0, 0);
	let canvasSize = new Vector(500, 500);
	let labelMargin = new Vector(40, 20);

	$: {
		console.warn(data);
		if (data) 
		{
			calcDomains();
			if (ctx) render();
		}
	}


	function calcDomains() {
		xDomain = new Vector(Infinity, -Infinity);
		yDomain = new Vector(0, 0);
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

		domainScalar = new Vector(
			1 / (xDomain.value[1] - xDomain.value[0]),
			1 / (yDomain.value[1] - yDomain.value[0])
		);
		console.warn(data, xDomain, yDomain);
	}
	
	function render() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		renderAxis();

		for (let line of data) renderLine(line);
	}


	
	function renderLine(_line) {
		if (_line.data.length < 1) return;
		ctx.strokeStyle = _line.color.hex;
		ctx.strokeWidth = 2;
		ctx.beginPath();

		_line.data.sort((a, b) => a.value[0] > b.value[0]);
	
		let prevCoord = pointToCanvasCoord(_line.data[0]);
		for (let p = 1; p < _line.data.length; p++)
		{
			let coord = pointToCanvasCoord(_line.data[p]);

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





	function renderAxis() {
		const textColor = '#777';
		const axisColor = '#ddd';
		const backgroundAxisColor = '#eee';
		const axisThickness = 1;

		let topLeftCoord = pointToCanvasCoord(new Vector(xDomain.value[0], yDomain.value[1]));
		let bottomLeftCoord = pointToCanvasCoord(new Vector(xDomain.value[0], yDomain.value[0]));
		let middleLeftCoord = pointToCanvasCoord(new Vector(xDomain.value[0], 0));
		let middleRightCoord = pointToCanvasCoord(new Vector(xDomain.value[1], 0));


		// Y-Axis
		let pxdy = bottomLeftCoord.value[1] - topLeftCoord.value[1];
		let dy = yDomain.value[1] - yDomain.value[0];
		
		ctx.fillStyle = axisColor;
		ctx.fillRect(topLeftCoord.value[0], 0, axisThickness, dy);
		
		const yLabelCount = pxdy / 50;
		let stepSize = dy / yLabelCount;
		let stepOrder = 0.25 * 10**(String(stepSize).split('.')[0].length);


		// let 
		let yValue = yDomain.value[0];
		while (yValue < yDomain.value[1])
		{
			yValue += stepOrder;
			let yCoord = pxdy - (yValue - yDomain.value[0]) / dy * pxdy;

			ctx.textBaseline = 'middle';
			ctx.textAlign = 'right';
			ctx.fillStyle = textColor;
			
			ctx.fillStyle = backgroundAxisColor;
			ctx.fillRect(labelMargin.value[0], yCoord, canvas.width - labelMargin.value[0], 1);
			ctx.fill();

			ctx.fillStyle = axisColor;
			ctx.fillRect(labelMargin.value[0] - 5, yCoord, 5, 2);
			ctx.fill();

			ctx.fillStyle = textColor;
			ctx.fillText(yValue, labelMargin.value[0] - 10, yCoord);
			ctx.fill();
		}




		// X-Axis
		let dx = xDomain.value[1] - xDomain.value[0];
		let pxdx = middleRightCoord.value[0] - middleLeftCoord.value[0];

		ctx.fillStyle = axisColor;
		ctx.fillRect(middleLeftCoord.value[0], middleLeftCoord.value[1], pxdx, axisThickness);

		const xLabelCount = pxdx / 50;
		for (let l = 0; l < xLabelCount; l++)
		{
			let perc = l / xLabelCount;
			ctx.textBaseline = 'bottom';
			ctx.textAlign = 'center';

			let pxX = perc * pxdx + labelMargin.value[0];
			let x = Math.round(dx * perc + xDomain.value[0]);
			let label = x;
			if (x > 10000000) 
			{
				let date = new Date(x);
				label = date.getMonths()[date.getMonth()].name.substr(0, 3) + ' ' + date.getFullYear();
			}

			ctx.fillStyle = backgroundAxisColor;
			ctx.fillRect(pxX, 0, 1, canvas.height - labelMargin.value[1]);
			ctx.fill();

			ctx.fillStyle = axisColor;
			ctx.fillRect(pxX, canvas.height - labelMargin.value[1], 2, 5);
			ctx.fill();

			ctx.fillStyle = textColor;
			ctx.fillText(label, pxX, canvas.height);
			ctx.fill();
		}


		ctx.fill();
	}


	function pointToCanvasCoord(_coord) {
		let relCoord = new Vector(
			_coord.value[0] - xDomain.value[0], 
			_coord.value[1] - yDomain.value[0]
		).elementWiseProduct(domainScalar);
		relCoord.value[1] = 1 - relCoord.value[1];

		return relCoord.elementWiseProduct(canvasSize.copy().subtract(labelMargin)).add(new Vector(labelMargin.value[0], 0));
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
	.GraphHolder {
	}

	canvas {
		position: relative;
		width: 100%;
		height: 100%;
		padding: 10px;
	}
</style>