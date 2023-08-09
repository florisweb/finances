<script>
	import Tag from "./tag.svelte";
	import DropDown from "./dropDown.svelte";
	import TagManager from "../data/tagManager";
	import { createEventDispatcher } from 'svelte';
	
	export let value = 0;
	console.log('new value', value);
	const dispatch = createEventDispatcher();
	$: dispatch('change', value);
	
	let tags = [];
	TagManager.dataStore.subscribe((_tags) => tags = _tags);
</script>

<DropDown options={tags.map((_tag) => {
	return {
		value: _tag,
		contentHTML: {
			component: Tag,
			config: _tag
		}
	}
})} value={value}></DropDown>
