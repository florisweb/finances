<script>
	export let title;
</script>
<div class="titleHolder">{title}</div>

<style>
	.titleHolder {
		position: relative;
		height: 30px;
		line-height: 30px;
		font-size: 16px;
		color: #222;
		font-style: italic;
		display: inline;
	}

	.titleHolder::after {
		position: absolute;
		left: 0;
		top: 25px;
		content: '';
		width: 100px;
		height: 3px;
		background: #daf;
	}
</style>