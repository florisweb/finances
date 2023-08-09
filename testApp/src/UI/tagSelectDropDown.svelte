<script>
	import Tag from "./tag.svelte";
	import DropDown from "./dropDown.svelte";
	import TagManager from "../data/tagManager";
	import { createEventDispatcher } from 'svelte';

	export let value = 0; // cur tag id
	const dispatch = createEventDispatcher();
	
	let tags = [];
	TagManager.dataStore.subscribe((_tags) => {tags = _tags; value = value});
</script>

<DropDown options={tags.map((_tag) => {
	return {
		value: _tag.id,
		contentHTML: {
			component: Tag,
			config: _tag
		}
	}
})} value={value} on:change={(_event) => dispatch('change', _event.detail)}></DropDown>
