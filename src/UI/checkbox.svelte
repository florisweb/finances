<script>
	import { newId } from '../polyfill';

	export let checked = false;
	export let title = '';
	export let disabled = false;
	let checkBoxId = 'checkbox' + newId();
</script>

<div class='holder' class:disabled={disabled}>
	<input type="checkbox" id={checkBoxId} checked={checked} disabled={disabled} on:change={(_event) => checked = _event.target.checked}>
  	<label for={checkBoxId}>{title}</label>
</div>

<style>
	.holder {
		position: relative;
		width: auto;
		height: 30px;
	}
	label {
		font-size: 14px;
		color: #96b;
		height: 30px;
		line-height: 30px;
		margin-left: 8px;
	}

	input[type="checkbox"] {
		visibility: hidden;
	}

	label::after {
		position: absolute;
		left: 0;
		top: 0;

		width: 14px;
		height: 14px;
		margin: 6px;

		content: '-';
		color: transparent;
		display: inline-block;

		border: 2px solid #daf;
		border-radius: 20px;
	}

	label::before {
		position: absolute;
		left: 0px;
		top: 0;

		width: 10px;
		height: 10px;

		margin: 10px;

		content: '-';
		color: transparent;
		display: inline-block;

		background: #daf;
		border-radius: 20px;
		opacity: 0;
	}

	.holder.disabled label::before, .holder.disabled label::after {
		filter: grayscale(1);
		opacity: .5;
	}


	input[type=checkbox]:checked + label::before {
		opacity: 1;
	}

  

</style>