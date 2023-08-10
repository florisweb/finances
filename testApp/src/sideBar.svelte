<script>
	import { openPageByIndex } from './App.js';
	import Button from './UI/button.svelte';
</script>

<div id='sideBar'>
	<div class="item appLogo">
		<div class='appLogo'>
			FinanceManager
		</div>
	</div>

	<div class="item">
		<Button name='Month Overview' on:click={() => openPageByIndex(2)}></Button>
	</div>
	<div class="item">
		<Button name='Tags' on:click={() => openPageByIndex(1)}></Button>
	</div>
	<div class="item">
		<Button name='Budgetter' on:click={() => openPageByIndex(3)}></Button>
	</div>

	<hr style='border-top: 1px solid #daf; margin-bottom: 20px;'>
	<div class="item">
		<Button name='Upload CSV' on:click={() => openPageByIndex(0)}></Button>
	</div>
</div>

<style>
	#sideBar {
		position: absolute;
		left: 0;
		top: 0;
		height: 100vh;
		width: calc(var(--sideBarWidth));

		padding: 20px;
		border-right: 2px dashed #daf;
	}

	.item {
		margin-bottom: 20px;
	}

	.item.appLogo {
		margin-bottom: 40px;
	}
	.item .appLogo {
		color: #daf; 
		font-size: 20px; 
		margin-bottom: 20px;
		text-transform: uppercase;
		font-style: italic;
	}
	
	.item > .appLogo::after {
		position: absolute;
		left: 25px;
		top: 45px;
		content: '';
		width: 100px;
		height: 3px;
		background: #daf;
	}

	.item .button {
		margin: 0;
		transition: background .3s, padding-right .3s;
	}
	.item .button:after { 
		position: absolute;
		content: '⚠';
		opacity: 0;
		margin-left: -30px;
		transition: opacity .3s;
	}

	.item .button.warning {
		background: var(--warningColor);
		padding-right: 30px;
	}
	.item .button.warning:after {
		content: '⚠';
		opacity: 1;
		margin-left: 5px;
	}
</style>