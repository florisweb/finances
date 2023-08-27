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
	export function close() {
		isOpen = false;
		inEditMode = false;
	}
	export function openEdit(_tag) {
		isOpen = true;
		inEditMode = true;
		curTag = _tag.clone();
	}

	function saveTag() {
		let constructor = curTag.isSavingsTag ? SavingsTransactionTag : TransactionTag;
		TagManager.add(new constructor(curTag.export()));
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
	<Checkbox title='Is savings tag' bind:checked={curTag.isSavingsTag}></Checkbox>
	<br>
	<Input on:input={(_event) => curTag.name = _event.detail} value={curTag.name} bind:element={nameInput}  placeholder='Tag name...'></Input>
	<br>
	<br>
	<br>
	<FilterBuilder bind:filter={curTag.filter}></FilterBuilder>
	<!-- <FilterBuilder></FilterBuilder> -->
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
</style>