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
	let canvasCentre = canvasSize.copy().scale(.5);
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
		let delta = canvasCentre.copy().difference(pos);
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

		let validPieces = 0;
		for (let piece of data) 
		{
			let perc = piece.value / data.map(a => a.value).reduce((a, b) => a + b, 0);
			if (isNaN(perc)) continue;
			validPieces++;
			let dAngle = perc * 2 * Math.PI;
			renderPiece(piece, curAngle - Math.PI / 2, curAngle + dAngle - Math.PI / 2);
			
			if (curHoverPiece === piece)
			{
				hoverStartAngle = curAngle;
				hoverDAngle = dAngle;
			}
			curAngle += dAngle;
		}

		if (validPieces === 0) renderPiece({name: '', value: 1, color: "#f7f7f7"}, 0, Math.PI * 2);

		if (!curHoverPiece) return;
		renderPiece(curHoverPiece, hoverStartAngle - Math.PI / 2, hoverStartAngle + hoverDAngle - Math.PI / 2, true);
	}



	const padding = 5;
	const height = 20;
	const circlePadding = 5;
	function renderPiece(_piece, _startAngle, _stopAngle, _hoveredOn) {
		let nameArr = _piece.name;
		if (typeof nameArr === 'string') nameArr = [nameArr];

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
		ctx.moveTo(canvasCentre.value[0], canvasCentre.value[1]);
		ctx.arc(canvasCentre.value[0], canvasCentre.value[1], radius, _startAngle, _stopAngle);
		ctx.lineTo(canvasCentre.value[0], canvasCentre.value[1]);
		ctx.closePath();
		ctx.stroke();
		ctx.fill();

		
		let textPos = canvasCentre.copy().add(new Vector().setAngle(_startAngle + deltaAngle / 2, radius * .6));
		ctx.fillStyle = '#fff';
		ctx.font = '15px arial';
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'center';
		
		
		



		const innerRadius = height / deltaAngle;
		let maxWidth = radius - circlePadding - innerRadius;

		let maxName = getMaxFittableName(nameArr, maxWidth)
		if (!maxName && !_hoveredOn) return;


		if (_hoveredOn)
		{
			let fullName = nameArr.join(' ');
			const requiredWidth = ctx.measureText(fullName).width + 2 * padding;
			let realWidth = Math.min(requiredWidth, canvas.width);
			const maxBoxWidth = Math.min(textPos.value[0], canvas.width - textPos.value[0]) * 2;
			
			let xPos = textPos.value[0];
			if (maxBoxWidth < realWidth) {
				if (xPos < canvas.width / 2)
				{
					xPos -= (maxBoxWidth - realWidth) / 2;
				} else xPos += (maxBoxWidth - realWidth) / 2;
			} 
		

			const boxHeight = height + 2 * padding;
			let name = fullName;
			name = getMaxFittableName(nameArr, realWidth - 2 * padding);

			ctx.fillStyle = _piece.color;
			ctx.strokeStyle = '#fff';
			ctx.beginPath();
			ctx.fillRect(xPos - realWidth / 2, textPos.value[1] - boxHeight / 2 , realWidth, boxHeight);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.fillStyle = '#fff';
			ctx.beginPath();
			ctx.fillText(name, xPos, textPos.value[1]);
			ctx.closePath();
			ctx.fill();
			return;
		}



		let rotateAngle = _startAngle / 2 + _stopAngle / 2;
		let flipped = rotateAngle > 0.5 * Math.PI;
		if (flipped) rotateAngle -= Math.PI;

		ctx.save();
		ctx.translate(canvasCentre.value[0], canvasCentre.value[1]);
		ctx.rotate(rotateAngle);
		ctx.fillStyle = '#fff';
		ctx.textAlign = 'right';
		if (flipped) ctx.textAlign = 'left';
		ctx.beginPath();
		let xPos = radius - circlePadding;
		if (flipped) xPos *= -1;
		ctx.fillText(maxName, xPos, 0);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}

	function getMaxFittableName(_name, _maxWidth) {
		let maxName = _name.join(' ');

		let width = ctx.measureText(maxName).width;
		if (_name.length === 1)
		{
			while (width > _maxWidth)
			{
				maxName = maxName.substring(0, maxName.length - 1);
				if (maxName.length < 5) return false;
				width = ctx.measureText(maxName).width;
			}

			return maxName;
		}
		
		let newNameArr = Object.assign([], _name);
		newNameArr.pop();
		if (width > _maxWidth) return getMaxFittableName(newNameArr, _maxWidth);
		return maxName;
	}






	


	window.addEventListener('resize', () => onResize())
	function onResize() {
		const padding = 20;
		const extraTopPadding = 10;

		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.width + extraTopPadding;

		canvasSize = new Vector(
			canvas.width,
			canvas.height
		);
		pieRadius = (canvas.width - 2 * padding) / 2;
		canvasCentre = new Vector(canvas.width / 2, (canvas.height - extraTopPadding) / 2 + extraTopPadding);
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
		position: absolute;
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