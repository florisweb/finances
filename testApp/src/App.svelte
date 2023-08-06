<script>
	import DropDown from "./UI/dropDown.svelte";
	import SideBar from "./sideBar.svelte";
	
	let options = [];

	for (let x = 0; x < 50; x++)
	{
		options.push({
			value: x,
			contentHTML: 'test ' + x
		});	
	}
</script>

<main>
	<SideBar></SideBar>
	<DropDown options={options} on:change={(_event) => console.log(_event.detail)}></DropDown>
</main>