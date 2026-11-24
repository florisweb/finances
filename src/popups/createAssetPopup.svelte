<script>
	import Popup from "./popup.svelte";
	import Header from "../UI/header.svelte";
    import Input from "../UI/input.svelte";
	import Button from "../UI/button.svelte";
	import MonthInput from "../UI/monthInput.svelte";
	import DropDown from "../UI/dropDown.svelte";

	import { Asset } from "../types";
    import TransactionManager from "../data/transactionManager";

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
	}

	function save() {
		curAsset.update();
		close();
	}

	let nameInput;
	$: if (isOpen && nameInput) nameInput.focus();

	const depreciationModeOptions = [
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
</script>

<Popup {isOpen} on:passiveClose={() => isOpen = false} customClass='createAssetPopup'>
	<Header slot='header' title='Edit Asset'></Header>
	<br>
	<br>
	<Input on:input={(_event) => curAsset.name = _event.detail} value={curAsset.name} bind:element={nameInput}  placeholder='Asset name...'></Input>
	<br>

	<Input placeholder='Custom value' type='number'></Input>
	<MonthInput></MonthInput>


	<DropDown options={depreciationModeOptions}></DropDown>
	
	<Button name={"Select transactions (" + curAsset.transactions?.length + ")"} on:click={openTransactionSelector}></Button>

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
</style>