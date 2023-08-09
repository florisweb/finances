<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let customClass;
	export let isOpen = false;
	export let options;
	export let value = false;

	$: dispatch('change', value);
	let selectedOptionContentHTML = 'No option selected';
	$: selectedOptionContentHTML = options.find((_opt) => _opt.value === value)?.contentHTML || 'No option selected';

	$: if (isOpen) updatePanelPosition();

	
	let optionPanel;
	let openAbove = true;
	let top = 0;
	let maxHeight = 500;

	function updatePanelPosition() {
		if (!optionPanel) return;
		const screenMargin = 20;
		
		let box = optionPanel.getBoundingClientRect();
		let panelHeight = optionPanel.offsetHeight;
	
		let topSpaceLeft = box.top - panelHeight - screenMargin;
		let bottomSpaceLeft = window.innerHeight - (box.top + panelHeight) - screenMargin;

		let biggestSpace = Math.max(topSpaceLeft, bottomSpaceLeft);
		maxHeight = panelHeight + biggestSpace;
		openAbove = topSpaceLeft === biggestSpace;	
	}
</script>


<div class={"wrapper " + (customClass ? customClass : '') + (isOpen ? ' optionPanelOpen' : '')}>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class='button' on:click={() => isOpen = !isOpen}>
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
		class={'optionPanel' + (openAbove ? ' openAbove' : '')} 
		style={'top: ' + top + 'px; max-height: ' + maxHeight + 'px'}
	>
		{#each options as option}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class='option' on:click={() => {value = option.value; isOpen = false}}>
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
		display: flex;
		
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
	}



	/* OPTIONPANEL */
	.wrapper .optionPanel {
		position: absolute;
		min-width: 120px;
		height: auto;

		padding: 10px 15px;

		box-shadow: 10px 10px 30px 10px rgba(0, 0, 0, .05);
		border: 1px solid #eee;

		z-index: 1000;
		background: #fff;

		transition: opacity .3s, margin-top .3s;

		margin-top: 0;
		overflow: auto;
	}

	.wrapper:not(.optionPanelOpen) .optionPanel {
		pointer-events: none;
		opacity: 0;
		margin-top: -20px;
	}
	.wrapper:not(.optionPanelOpen).openAbove .optionPanel {
		margin-top: 20px;
	}

	.wrapper.openAbove .optionPanel {
		transform: translateY(calc(-100% - 35px));
	}


	/* OPTION */
	.option {
		cursor: pointer;
	}
	.option:not(:first-child) {
		margin-top: 10px;
	}

	.option > a {
		position: relative;
		height: 20px;
		line-height: 20px;
		font-size: 13px;
		color: #444;
		margin-left: -5px;
	}
</style>