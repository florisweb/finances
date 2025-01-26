<script>	
    import { MonthIdentifier } from '../types';
	import Vector from '../vector';

	export let title = '';
	export let data = [{data: []}];
	export let customClass = '';
	export let maxWidth = Infinity;
	export let maxheight = Infinity;
	export let config = {};
	$: config = {
		drawDotsOnLine: true,
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
		Camera.size.value = [
			Math.min(xDomain.value[1] - xDomain.value[0], maxWidth),
			Math.min(yDomain.value[1] - yDomain.value[0], maxheight)
		];
		
		Camera.position.value = [
			xDomain.value[1] - Camera.size.value[0],
			yDomain.value[0] + Camera.size.value[1],
		];
	}



	const textColor = '#777';
	const axisColor = '#ccc';
	const backgroundAxisColor = '#eee';
	const axisThickness = 1;
	
	function render() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		renderYAxis();
		renderXAxis();

		for (let line of data) renderLine(line);

		if (!curHoverPoint) return;
		renderPointInfo(curHoverPoint);
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

		if (!config.drawDotsOnLine) return;
		for (let p = 0; p < _line.data.length; p++)
		{
			let coord = Camera.worldToPxCoord(_line.data[p]);
			ctx.fillStyle = '#fff';
			ctx.strokeStyle = _line.color.hex;;
			ctx.beginPath();
			ctx.drawCircle(coord.value[0], coord.value[1], 2);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}
	}

	function renderXAxis() {
		ctx.clearRect(0, canvas.height - Camera.labelMargin.value[1], canvas.width, Camera.labelMargin.value[1]);

		ctx.fillStyle = axisColor;
		ctx.fillRect(0, canvas.height - Camera.labelMargin.value[1], canvas.width, axisThickness);
		ctx.fill();
		
		const xLabelCount = canvas.width / 100;
		let stepSize = Camera.size.value[0] / xLabelCount;
		let stepOrder = 0.25 * 10**(String(stepSize).split('.')[0].length);
		let startVal = Math.floor(Camera.position.value[0] / stepOrder) * stepOrder;

		const isDateAxis = startVal > 10000000;
		if (!isDateAxis) 
		{
			for (let x = startVal; x < Camera.position.value[0] + Camera.size.value[0] + stepOrder; x += stepOrder)
			{
				let coord = Camera.worldToPxCoord(new Vector(x, 0));
				renderXLabel(x, coord);
			}
			return;
		}


		// Fix the startValue to the start of the month
		const dayLength = 1000 * 60 * 60 * 24; 
		const firstMonthId = new MonthIdentifier().setFromDate(new Date(startVal));
		startVal = firstMonthId.date.getTime();

		let x = startVal;
		while (x < Camera.position.value[0] + Camera.size.value[0] + dayLength)
		{
			let monthId = new MonthIdentifier().setFromDate(new Date(x));
			let coord = Camera.worldToPxCoord(new Vector(x, 0));


			let label = monthId.date.getMonths()[monthId.date.getMonth()].name.substr(0, 3) + ' ' + monthId.date.getFullYear();
			renderXLabel(label, coord);

			x = monthId.date.moveMonth(1).getTime();
		}
	}

	function renderXLabel(_label, _coord) {
		ctx.textBaseline = 'top';
		ctx.textAlign = 'center';

		// Vertical axis
		if (_coord.value[0] >= Camera.labelMargin.value[0])
		{
			ctx.fillStyle = backgroundAxisColor;
			ctx.fillRect(_coord.value[0], 0, 1, canvas.height);
			ctx.fill();
		}

		if (!config.renderLabels) return;
		// Little extenders
		ctx.fillStyle = axisColor;
		ctx.fillRect(_coord.value[0], canvas.height - Camera.labelMargin.value[1], 2, 5);
		ctx.fill();

		ctx.fillStyle = textColor;
		ctx.fillText(_label, _coord.value[0], canvas.height - Camera.labelMargin.value[1] + 5);
		ctx.fill();
	}

	function renderYAxis() {
		const yLabelHeight = 50;

		ctx.clearRect(0, 0, Camera.labelMargin.value[0], canvas.height);

		// Y-Axis
		let dy = yDomain.value[1] - yDomain.value[0];
		
		ctx.fillStyle = axisColor;
		ctx.fillRect(Camera.labelMargin.value[0], 0, axisThickness, dy);
		
		const yLabelCount = canvas.height / yLabelHeight;
		let stepSize = Camera.size.value[1] / yLabelCount;
		let stepOrder = 0.1 * 10**(String(stepSize).split('.')[0].length);
		while (Camera.size.value[1] / stepOrder > yLabelCount)
		{
			stepOrder *= 2;
		}

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
		#labelMargin = new Vector(45, 25);
		#graphTopRightMargin = new Vector(20, 20);
		get labelMargin() {
			if (config.renderLabels) return this.#labelMargin;
			return new Vector(0, 0);
		}
		
		// World:
		// /\ - size
		// pos ---> size

		worldToPxCoord(_coord, _absolute = false) {
			return new Vector(
				(_coord.value[0] - this.position.value[0] * (!_absolute)) / this.size.value[0] * (canvas.width - this.labelMargin.value[0] - this.#graphTopRightMargin.value[0]) + this.labelMargin.value[0],
				-(_coord.value[1] - this.position.value[1] * (!_absolute)) / this.size.value[1] * (canvas.height - this.labelMargin.value[1] - this.#graphTopRightMargin.value[1]) + this.#graphTopRightMargin.value[1],
			);
		}
		
		pxToWorldCoord(_coord, _absolute = false) {
			return new Vector(
				(_coord.value[0] - this.labelMargin.value[0]) / (canvas.width - this.labelMargin.value[0] - this.#graphTopRightMargin.value[0]) * this.size.value[0] + this.position.value[0] * (!_absolute),
				-(_coord.value[1] - this.#graphTopRightMargin.value[1]) / (canvas.height - this.labelMargin.value[1] - this.#graphTopRightMargin.value[1]) * this.size.value[1] - this.position.value[1] * (!_absolute)
			);
		}

		eventToPxCoord(_e) { // px-coord = pixel of canvas
			return new Vector(
				_e.offsetX / canvas.offsetWidth * canvas.width,
				_e.offsetY / canvas.offsetHeight * canvas.height,
			);
		}	
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
	<div class='headerHolder'>
		<div class='titleHolder'>{title}</div>
		<div class='legendHolder'>
			{#each data as line}
				{#if line.name}
					<div class='legendItem'>
						<div class="colorIndicator" style={`background: ${line.color.hex}`}></div>
						{line.name}
					</div>
				{/if}
			{/each}
		</div>
	</div>
	<canvas bind:this={canvas} width="1000" height="300"></canvas>
</div>



<style>
	.GraphHolder {
		position: relative;
		width: 100%;
		height: 100%;
		border: 1px solid #eee;
		box-shadow: 5px 5px 20px 20px rgba(0, 0, 0, .01);
		display: flex;
		flex-direction: column;
	}

	.headerHolder {
		position: relative;
		width: 100%;
		height: 25px;
		padding: 5px 20px;
		display: flex;
		flex-direction: row;
		pointer-events: none;
	}
		.titleHolder {
			position: relative;
			left: 0;
			top: 0;
			line-height: 25px;
			color: #555;
		}

		.legendHolder {
			position: relative;
			margin-left: auto;
			
			display: flex;
			flex-direction: row;
		}
		.legendItem {
			height: 25px;
			line-height: 25px;
			display: flex;
			flex-direction: row;
			font-size: 12px;
		}
		.legendItem .colorIndicator {
			position: relative;
			background-color: #f00;
			width: 8px;
			aspect-ratio: 1;
			border-radius: 100%;
			margin: calc((25px - 8px)/2);
		}
	

	canvas {
		position: relative;
		width: 100%;
		height: 100%;
	}
</style>