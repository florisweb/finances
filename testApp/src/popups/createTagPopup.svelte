<script>
	import Popup from "./popup.svelte";
	import Header from "../UI/header.svelte";
	import DropDown from "../UI/dropDown.svelte";
	import ColorCircleSet from "../UI/colorCircleSet.svelte";
    import Input from "../UI/input.svelte";
    import Button from "../UI/button.svelte";

	import TagManager from "../data/tagManager";
	import { TransactionTag } from "../types";
	import { AvailableColors } from '../color';


	let isOpen = false;
	let curTag = new TransactionTag({
		name: null,
		color: AvailableColors[0].color,
	});
	let inEditMode = false;


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
		curTag = Object.assign({}, _tag);
	}

	function saveTag() {
		TagManager.add(new TransactionTag(curTag));
		close();
	}
</script>

<Popup {isOpen} on:passiveClose={() => isOpen = false}>
	<Header slot='header' title={(inEditMode ? 'Edit' : 'Create') + ' Tag'}></Header>
	<DropDown on:change={(_event) => curTag.color = _event.detail} value={curTag.color} options={AvailableColors.map((_colorSet) => {
		return {
			value: _colorSet.color,
			contentHTML: {
				component: ColorCircleSet,
				config: _colorSet
			}
		}
	})}></DropDown>

	<Input on:input={(_event) => curTag.name = _event.detail} value={curTag.name} placeholder='Tag name...'></Input>
	
	<div class='buttonHolder'>
		<Button name='Save' on:click={() => {saveTag(); console.log('create')}}></Button>
		<Button name='Cancel' on:click={() => {isOpen = false; console.log('cancel')}}></Button>
	</div>
</Popup>

<style>
	.buttonHolder {
		display: flex;
		flex-direction: row-reverse;
	}
</style>