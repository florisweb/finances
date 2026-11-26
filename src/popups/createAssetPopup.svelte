<script>
  	import { fade, slide } from 'svelte/transition';


	import Popup from "./popup.svelte";
	import Header from "../UI/header.svelte";
    import Input from "../UI/input.svelte";
	import MoneyInput from "../UI/moneyInput.svelte";
	import Button from "../UI/button.svelte";
	import MonthInput from "../UI/monthInput.svelte";
	import DropDown from "../UI/dropDown.svelte";
	import CheckBox from "../UI/checkbox.svelte";

	import { Asset, MonthIdentifier } from "../types";
    import TransactionManager from "../data/transactionManager";
    import { formatMoneyString } from "../polyfill";
    import { validate_component } from 'svelte/internal';


	let isOpen = false;
	let curAsset = new Asset({
		name: null,
	});

	export async function close() {
		isOpen = false;
		App.transactionViewerPopup.close();
	}
	export function openEdit(_asset) {
		isOpen = true;
		curAsset = _asset.clone();
		usingManualInitialValues = curAsset.customInitialValue || curAsset.customStartDate;
		manualStartMonthIdentifier = curAsset.customStartDate ? new MonthIdentifier().setFromDate(curAsset.customStartDate) : null;
		manualInitialValue = curAsset.customInitialValue;
	}

	function save() {
		if (!usingManualInitialValues)
		{
			curAsset.customInitialValue = null;
			curAsset.customStartDate = null;
		} else {
			curAsset.customInitialValue = manualInitialValue;
			curAsset.customStartDate = manualStartMonthIdentifier.date;
		}

		curAsset.update();
		close();
	}

	let nameInput;
	$: if (isOpen && nameInput) nameInput.focus();

	const depreciationModeOptions = [
		{
			value: 'none',
			contentHTML: "No Depreciation"
		},	
		{
			value: 'fixed',
			contentHTML: "Fixed Amount"
		},
		{
			value: 'percentage',
			contentHTML: "Percentage"
		}
	];


	async function openTransactionSelector() {
		let transactions = TransactionManager.data;
		for (let trans of transactions)
		{
			trans._selected = curAsset.transactions.find(t => t.id === trans.id);
		}

		let selected = await App.transactionViewerPopup.openInSelectMode(transactions, 'Select transaction(s) for ' + curAsset.name);
		curAsset.transactions = selected;
		curAsset = curAsset; // Update
	}

	let usingManualInitialValues = false;
	let manualStartMonthIdentifier;
	let manualInitialValue;

	let autoDetectedInitialStartMonthIdentifier;
	$: autoDetectedInitialStartMonthIdentifier = curAsset.startDate ? new MonthIdentifier().setFromDate(curAsset.startDate) : null;

	let percentageDepreciationRate;
	$: percentageDepreciationRate = curAsset.percentageDepreciationRate * 100;

	let monthsUntilDepreciation;
	$: monthsUntilDepreciation = new MonthIdentifier().setFromDate(curAsset.startDate).monthsBetween(curAsset.expectedDepreciationMonth)
</script>

<Popup {isOpen} on:passiveClose={() => isOpen = false} customClass='CreateAssetPopup'>
	<Header slot='header' title='Edit Asset'></Header>
	<br>
	<br>
	<Input class='test' on:input={(_event) => curAsset.name = _event.detail} value={curAsset.name} bind:element={nameInput}  placeholder='Asset name...'></Input>
	<br>

	<div class='contentHolder'>
		<div class="panel leftPanel">
			<div class="panelHeader">Asset data</div>
			<Button name={"Select transactions (" + curAsset.transactions?.length + ")"} on:click={openTransactionSelector}></Button>
			<div style='margin-top: 5px'></div>
			<CheckBox 
				title="Manual initial values" 
				bind:checked={usingManualInitialValues}
			></CheckBox>
			
			{ #if !usingManualInitialValues }
				<div class='autoDetectedValueHolder' in:slide={{duration: 300}} out:slide={{duration: 300}}>
					Detected: {formatMoneyString(curAsset?.initialValue, true, false)} - {autoDetectedInitialStartMonthIdentifier?.shortName}
				</div>
			{ :else}
				<div style='margin-top: 5px' in:slide={{duration: 300}} out:slide={{duration: 300}}>
					<div class="panelHeader">Manual entry</div>
					<MoneyInput value={manualInitialValue} on:change={(event) => manualInitialValue = event.detail}></MoneyInput>
					<MonthInput bind:value={manualStartMonthIdentifier}></MonthInput>
				</div>
			{ /if}
		</div>
		<div class="seperator"></div>
		<div class="panel rightPanel">
			<div class="panelHeader">Asset depreciation</div>
			<DropDown options={depreciationModeOptions} value={curAsset.depreciationMode || "none"} on:change={(event) => curAsset.depreciationMode = event.detail}></DropDown>
			<div style='margin-top: 5px'></div>
			{ #if curAsset.depreciationMode == "fixed" }
				<MoneyInput 
					value={curAsset.fixedDepreciationRate} 
					on:input={(event) => curAsset.fixedDepreciationRate = event.detail}
				></MoneyInput>
			{ :else if curAsset.depreciationMode == "percentage" }
				<Input 
					placeholder='% / month' 
					value={percentageDepreciationRate}
					on:input={(event) => curAsset.percentageDepreciationRate = event.detail / 100} 
				></Input>
			{/if}

			{ #if curAsset.depreciationMode != "none" }

				<div class="depreciationDuration">
					Time until fully depreciated: {
						isNaN(monthsUntilDepreciation) ? 'Infinite' : (
							monthsUntilDepreciation > 12 
								? Math.floor(monthsUntilDepreciation / 12) + ' years ' + monthsUntilDepreciation % 12 
								: monthsUntilDepreciation
						)
					} months
					<!-- LITTLE GRAPH? -->
				</div>
			{ /if }
		</div>	
	</div>
	
	
	

	<br>
	<div class='buttonHolder'>
		<Button name='Save' on:click={save}></Button>
		<Button name='Cancel' filled={false} on:click={close}></Button>
	</div>
</Popup>


<style>
	


	.buttonHolder {
		display: flex;
		flex-direction: row-reverse;
	}

	.contentHolder {
		margin-top: 20px;
		height: auto;

		display: grid;
		grid-template-columns: 1fr 1px 1fr;
		gap: 20px;
	}

	.panel {
		display: flex;
		flex-direction: column;
	}
	.panel > * {
		display: inline-block;
	}
	.panel .panelHeader {
		font-size: 12px;
		text-transform: uppercase;
		color: #333;
		margin-bottom: 10px;
	}
	.autoDetectedValueHolder, 
	.depreciationDuration {
		font-size: 12px;
		color: #555;
		margin-top: 10px;
	}


	
	.seperator {
		margin-top: 20px;
		width: 1px;
		height: calc(100% - 20px * 2);
		background-color: #ccc;
	}
</style>