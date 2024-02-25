<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	import { wait } from '../polyfill';

	export let customClass;
	export let isOpen = false;
	export let options;
	export let value = false;
	
	let selectedOptionContentHTML = 'No option selected';
	$: {
		selectedOptionContentHTML = options.find(
			(_opt) => 
				_opt.value === value || (
					_opt.value.id === value.id && 
					_opt.value.id !== undefined
				)
		)?.contentHTML || 'No option selected';	
	}

	
	let closingPromise;;
	let optionPanel;
	let button;
	let openAbove = false;
	let top = 0;
	let maxHeight = Infinity;
	
	$: if (isOpen) updatePanelPosition();
	async function updatePanelPosition() {
		if (!optionPanel || !button) return;
		await closingPromise;
		const screenMargin = 5;

		optionPanel.style.top = '0px';
		let panelTop = optionPanel.getBoundingClientRect().top;
		let buttonTop = button.getBoundingClientRect().top;
		let panelHeight = optionPanel.offsetHeight;	

		let spaceAbove = buttonTop;
		let spaceBelow = window.innerHeight - buttonTop - button.offsetHeight;
		
		openAbove = spaceBelow < panelHeight && spaceBelow < spaceAbove;
		if (openAbove)
		{
			maxHeight = spaceAbove - screenMargin;
		} else maxHeight = spaceBelow - screenMargin;

		top = buttonTop - panelTop;
		if (openAbove) 
		{
			top -= Math.min(maxHeight, panelHeight);
		} else top += button.offsetHeight;
	}

	$: if (!isOpen) closingPromise = onClose();
	async function onClose() {
		await wait(300);
		openAbove = false;
		top = 0;
		maxHeight = Infinity;
	}
</script>


<div class={"wrapper " + (customClass ? customClass : '') + (isOpen ? ' optionPanelOpen' : '') + (openAbove ? ' openAbove' : '')}>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class='button' on:click={() => isOpen = !isOpen} bind:this={button}>
		<img src='images/dropDownIconDark.png' alt="Dropdown icon." class='dropDownIcon'>
		<div class='contentHolder'>
			{#if (typeof selectedOptionContentHTML === 'object')}
				<svelte:component this={selectedOptionContentHTML.component} {...selectedOptionContentHTML.config}/>
			{:else}
				{selectedOptionContentHTML}
			{/if}
		</div>
	</div>
	<div 
		bind:this={optionPanel}
		class='optionPanel' 
		style={'top: ' + top + 'px; max-height: ' + (maxHeight === Infinity ? 'none' : maxHeight + 'px')}
	>
		{#each options as option}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class='option' on:click={() => {value = option.value; dispatch('change', value); isOpen = false}}>
				{#if (typeof option.contentHTML === 'object')}
					<svelte:component this={option.contentHTML.component} {...option.contentHTML.config}/>
				{:else}
					{option.contentHTML}
				{/if}
			</div>
		{/each}
	</div>
</div>



<style>
	.wrapper {
		position: relative;
	}


	/* BUTTON */
	.wrapper .button {
		position: relative;
		display: inline-flex;
		
		width: auto;
		height: 35px;
		padding: 7.5px;

		font-size: 12px;
		background: #fff;
		box-shadow: 10px 10px 30px 10px rgba(0, 0, 0, .02);
		border: 1px solid #eee;
		
		margin: 0;
		
		cursor: pointer;
	}

	.wrapper .button .dropDownIcon {
		position: relative;
		height: 12px;
		width: auto;
		opacity: .5;
		margin: 4px;
		transition: transform .3s;
		transform: rotateZ(-90deg);
	}
	.wrapper.optionPanelOpen .button .dropDownIcon {
		transform: rotateZ(0);
	}
	.wrapper.optionPanelOpen.openAbove .button .dropDownIcon {
		transform: rotateZ(-180deg);
	}

	.wrapper .button .contentHolder { 
		position: relative;
		margin-left: 5px;
		height: 20px;
		line-height: 20px;
		width: auto;
		overflow: hidden;
		color: #333;
	}



	/* OPTIONPANEL */
	.wrapper .optionPanel {
		position: fixed;
		top: 0;
		z-index: 1000;

		min-width: 120px;
		height: auto;

		padding: 10px 15px;

		box-shadow: 10px 10px 30px 10px rgba(0, 0, 0, .05);
		border: 1px solid #eee;
		background: #fff;

		transition: opacity .3s, margin-top .3s;

		overflow: auto;
		/* margin-top: 10px; */
	}
	.wrapper.optionPanelOpen.openAbove .optionPanel {
		/* margin-top: -10px; */
	}

	.wrapper:not(.optionPanelOpen) .optionPanel {
		pointer-events: none;
		opacity: 0;
		/* margin-top: 0px; */
	}

	

	/* OPTION */
	.option {
		cursor: pointer;
	}
	.option:not(:first-child) {
		margin-top: 10px;
	}
</style>