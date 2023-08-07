<script>
	import DropDown from "./UI/dropDown.svelte";
	import SideBar from "./sideBar.svelte";
	import MainContent from "./mainContent.svelte";
	
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
	<MainContent openPageIndex={0}></MainContent>
	<DropDown options={options} on:change={(_event) => console.log(_event.detail)}></DropDown>
</main>