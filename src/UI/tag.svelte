<script>
	import ColorCircleSet from "./colorCircleSet.svelte";
	export let color;
	export let name = 'No name...';
</script>

<ColorCircleSet {color} {name}></ColorCircleSet>