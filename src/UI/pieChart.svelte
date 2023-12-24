<script>	
    import { text } from 'svelte/internal';
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


	let canvasSize = new Vector(500, 500);
	let pieRadius = 200;

	$: {
		if (data) {
			if (ctx) render();
		}
	}
	$: {
		if (canvas) {
			onResize();
			canvas.addEventListener('mousemove', handleMouseMove);
		}
	}

	


	let curHoverPiece = false;

	
	
	function handleMouseMove(_e) {
		let pos = new Vector(_e.offsetX, _e.offsetY);
		let delta = canvasSize.copy().scale(.5).difference(pos);
		if (delta.getLength() > pieRadius) {curHoverPiece = false; render(); return;}
		let angle = delta.getAngle();
		angle += .5 * Math.PI;
		if (angle < 0) angle += Math.PI * 2;

		let curAngle = 0;
		for (let piece of data) 
		{
			let perc = piece.value / data.map(a => a.value).reduce((a, b) => a + b, 0);
			if (isNaN(perc)) continue;
			let dAngle = perc * 2 * Math.PI;
			let startAngle = curAngle;
			curAngle += dAngle;
			if (startAngle > angle || curAngle < angle) continue;
			curHoverPiece = piece;
			return render();
		}
		curHoverPiece = false;
		render();
	}
	






	


	
	function render() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		let curAngle = 0;
		
		let hoverStartAngle = 0;
		let hoverDAngle = 0;
		for (let piece of data) 
		{
			let perc = piece.value / data.map(a => a.value).reduce((a, b) => a + b, 0);
			if (isNaN(perc)) continue;
			let dAngle = perc * 2 * Math.PI;
			renderPiece(piece, curAngle - Math.PI / 2, curAngle + dAngle - Math.PI / 2);
			
			if (curHoverPiece === piece)
			{
				hoverStartAngle = curAngle;
				hoverDAngle = dAngle;
			}
			curAngle += dAngle;
		}

		if (!curHoverPiece) return;
		renderPiece(curHoverPiece, hoverStartAngle - Math.PI / 2, hoverStartAngle + hoverDAngle - Math.PI / 2, true);
	}

	
	function renderPiece(_piece, _startAngle, _stopAngle, _hoveredOn) {
		let centre = canvasSize.copy().scale(.5);
		let deltaAngle = _stopAngle - _startAngle;

		ctx.strokeStyle = '#fff';
		ctx.fillStyle = _piece.color;
		ctx.lineWidth = 4;

		let radius = pieRadius + (_hoveredOn ? 5 : 0);

		ctx.shadowBlur = 0;
		if (_hoveredOn)
		{
			ctx.shadowColor = "rgba(0, 0, 0, .3)";
			ctx.shadowBlur = 15;
		}

		ctx.beginPath();
		ctx.moveTo(centre.value[0], centre.value[1]);
		ctx.arc(centre.value[0], centre.value[1], radius, _startAngle, _stopAngle);
		ctx.lineTo(centre.value[0], centre.value[1]);
		ctx.closePath();
		ctx.stroke();
		ctx.fill();

		if (deltaAngle < Math.PI / 180 * 20 && !_hoveredOn) return;
		let textPos = centre.copy().add(new Vector().setAngle(_startAngle + deltaAngle / 2, radius * .6));

		if (_hoveredOn)
		{
			let width = ctx.measureText(_piece.name).width + 10;
			let height = 30;
			ctx.fillStyle = _piece.color;
			ctx.strokeStyle = '#fff';
			ctx.beginPath();
			ctx.fillRect(textPos.value[0] - width / 2, textPos.value[1] - height / 2, width, height);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}


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