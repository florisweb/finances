<script>
	import { formatMoneyString } from '../polyfill';
	import { getContext } from 'svelte'
	const App = getContext('App')

	import AssetManager from "../data/assetManager";
	import Page from "../UI/page.svelte";	
    import Asset from '../UI/asset.svelte';



	let assets = [];
	AssetManager.dataStore.subscribe((_assets) => assets = _assets);
</script>

<Page title="Assets" customClass='assetPage'>

	<div class='dataHolder'>
		{#each assets as asset}
			<Asset {asset}></Asset>
		{/each}
	</div>
</Page>



<style>
	.dataHolder {
		display: flex;
		gap: 20px;
	}
</style>