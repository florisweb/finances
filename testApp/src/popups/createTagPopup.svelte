<script>
	import Popup from "./popup.svelte";
	import Header from "../UI/header.svelte";
	import DropDown from "../UI/dropDown.svelte";
	import ColorCircleSet from "../UI/colorCircleSet.svelte";

	import { AvailableColors } from '../color';
	export let isOpen = false;
</script>

<Popup {isOpen}>
	<Header slot='header' title='Create Tag'></Header>
	<DropDown options={AvailableColors.map((_colorSet) => {
		return {
			value: _colorSet.color,
			contentHTML: {
				component: ColorCircleSet,
				config: _colorSet
			}
		}
	})}></DropDown>
</Popup>
