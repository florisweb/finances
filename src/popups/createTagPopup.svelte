<script>
	import Popup from "./popup.svelte";
	import Header from "../UI/header.svelte";
	import DropDown from "../UI/dropDown.svelte";
	import ColorCircleSet from "../UI/colorCircleSet.svelte";
    import Input from "../UI/input.svelte";
    import Button from "../UI/button.svelte";
    import Checkbox from "../UI/checkbox.svelte";

	import TagManager from "../data/tagManager";
	import { TransactionTag, SavingsTransactionTag } from "../types";
	import { AvailableColors } from '../color';
    import FilterBuilder from "../UI/filterBuilder/filterBuilder.svelte";
    import TransactionManager from "../data/transactionManager";
	
	import { getContext } from 'svelte';
    import MoneyInput from "../UI/moneyInput.svelte";
	const App = getContext('App');

	let isOpen = false;
	let inEditMode = false;
	let curTag = new TransactionTag({
		name: null,
		color: AvailableColors[0].color,
	});

	export function open() {
		isOpen = true;
		inEditMode = false;
		curTag = new TransactionTag({
			name: null,
			color: AvailableColors[0].color,
		});
	}
	export async function close() {
		isOpen = false;
		inEditMode = false;
		let result = await TransactionManager.autoClassifyTransactions();
		App.statusMessage.open('Classified ' + result.newClassifies + ' new transactions (' + Math.round(result.classifies / TransactionManager.data.length * 1000) / 10 + '% classified)')
	}
	export function openEdit(_tag) {
		isOpen = true;
		inEditMode = true;
		curTag = _tag.clone();
	}

	function saveTag() {
		let constructor = curTag.isSavingsTag ? SavingsTransactionTag : TransactionTag;
		let data = curTag.export();
		data.startValue = curTag.startValue;
		TagManager.add(new constructor(data));
		close();
	}

	let nameInput;
	$: if (isOpen && nameInput) nameInput.focus();
</script>

<Popup {isOpen} on:passiveClose={() => isOpen = false} customClass='CreateTagPopup'>
	<Header slot='header' title={(inEditMode ? 'Edit' : 'Create') + ' Tag'}></Header>
	<br><br>
	<DropDown on:change={(_event) => curTag.color = _event.detail} value={curTag.color} options={AvailableColors.map((_colorSet) => {
		return {
			value: _colorSet.color,
			contentHTML: {
				component: ColorCircleSet,
				config: _colorSet
			}
		}
	})}></DropDown>
	<br>

	<div class='savingsTagHolder'>
		<Checkbox title='Is savings tag' bind:checked={curTag.isSavingsTag}></Checkbox>
		<div class='startValueHolder' class:hide={!curTag?.isSavingsTag}>
			<div class='startValueHeader'>Start value</div>
			<MoneyInput on:input={(_event) => curTag.startValue = _event.detail || 0} value={curTag?.startValue || 0} canBeNegative={true}></MoneyInput>
		</div>
	</div>

	<br>
	<Input on:input={(_event) => curTag.name = _event.detail} value={curTag.name} bind:element={nameInput}  placeholder='Tag name...'></Input>
	<br>
	<br>
	<br>
	<FilterBuilder bind:filter={curTag.filter}></FilterBuilder>
	<br>
	<div class='buttonHolder'>
		<Button name='Save' on:click={() => saveTag()}></Button>
		<Button name='Cancel' filled={false} on:click={() => close()}></Button>
	</div>
</Popup>

<style>
	.buttonHolder {
		display: flex;
		flex-direction: row-reverse;
	}


	.savingsTagHolder {
		margin-left: -8px;
	}
	.startValueHolder {
		margin-left: 8px;
		margin-bottom: 10px;
		padding-left: 12px;
		border-left: 3px solid #daf;
		transition: margin-top .3s, opacity .3s;
	}
	.startValueHolder.hide {
		opacity: 0;
		margin-top: -60px;
		pointer-events: none;
	}
	.startValueHolder .startValueHeader {
		font-size: 12px;
		text-transform: uppercase;
		color: #444;
		margin-bottom: 2px;
	}
</style>