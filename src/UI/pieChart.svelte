<script>	
	import Vector from '../vector';

	export let title = '';
	export let data = [{data: []}];
	export let customClass = '';
	export let config = {};

	// Data: 
	/*[
		{
			name,
			color,
			value
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

			// canvas.addEventListener('mousedown', handleDragStart);
			// window.addEventListener('mouseup', handleDragEnd);
			// canvas.addEventListener('mousemove', handleDragMove);
		}
	}

	let canvasSize = new Vector(500, 500);
	let pieRadius = 200;

	$: {
		if (data) {
			if (ctx) render();
		}
	}


	


	
	function render() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		let curAngle = 0;
		for (let piece of data) 
		{
			let perc = piece.value / data.map(a => a.value).reduce((a, b) => a + b, 0);
			if (isNaN(perc)) continue;
			let dAngle = perc * 2 * Math.PI;
			renderPiece(piece, curAngle - Math.PI / 2, curAngle + dAngle - Math.PI / 2);
			curAngle += dAngle;
		}
	}

	
	function renderPiece(_piece, _startAngle, _stopAngle) {
		let centre = canvasSize.copy().scale(.5);
		let deltaAngle = _stopAngle - _startAngle;

		ctx.strokeStyle = '#fff';
		ctx.fillStyle = _piece.color;
		ctx.lineWidth = 4;

		ctx.beginPath();
		ctx.moveTo(centre.value[0], centre.value[1]);
		ctx.arc(centre.value[0], centre.value[1], pieRadius, _startAngle, _stopAngle);
		ctx.lineTo(centre.value[0], centre.value[1]);
		ctx.closePath();
		ctx.stroke();
		ctx.fill();

		if (deltaAngle < Math.PI / 180 * 20) return;
		let textPos = centre.copy().add(new Vector().setAngle(_startAngle + deltaAngle / 2, pieRadius * .6));

		ctx.fillStyle = '#fff';
		ctx.font = '15px arial';
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'center';
		ctx.beginPath();
		ctx.fillText(_piece.name, textPos.value[0], textPos.value[1]);
		ctx.closePath();
		ctx.fill();
	}







	


	window.addEventListener('resize', () => onResize())
	function onResize() {
		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.width;

		canvasSize = new Vector(
			canvas.width,
			canvas.height
		);
		pieRadius = canvas.width * .45;
	}
</script>

<div class={'GraphHolder ' + customClass || ''}>
	<div class='titleHolder'>{title}</div>
	<canvas bind:this={canvas} width="1000" height="300"></canvas>
</div>



<style>
	.GraphHolder {
		position: relative;
		width: auto;
		height: auto;
	}

	.titleHolder {
		position: relative;
		width: 100%;
		left: 0;
		top: 0;
		pointer-events: none;
		text-align: center;
		font-size: 18px;
		z-index: 100;
	}
	canvas {
		position: relative;
		width: 100%;
		height: auto;
	}
</style>