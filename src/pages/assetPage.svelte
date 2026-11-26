<script>
	import { formatMoneyString } from '../polyfill';
	import { getContext } from 'svelte'
	const App = getContext('App')

	import AssetManager from "../data/assetManager";
	import Page from "../UI/page.svelte";	
    import Asset from '../UI/asset.svelte';



	let assets = [];
	AssetManager.dataStore.subscribe((_assets) => assets = _assets.sort((a, b) => {
		if (a.isDepreciated) return true;
		if (b.isDepreciated) return false;
		return a.startDate < b.startDate;
	}));
</script>

<Page title="Assets" customClass='assetPage'>

	<div class='dataHolder'>
		{ #if assets.length > 0 }
			{ #each assets as asset }
				<Asset {asset}></Asset>
			{ /each }
		{ :else }
			<div class='message'>
				No assets present 
				<br>
				<div class='subText'>Add one via the button below.</div> 
			</div>
		{ /if }
	</div>

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div on:click={() => App.createAssetPopup.open()}>Add an asset</div>
</Page>



<style>
	.dataHolder {
		display: flex;
		gap: 20px;
		flex-wrap: wrap;
	}

	.message {
		width: 100%;
		text-align: center;
	}
	.message .subText {
		color: #777; 
		font-size: 14px; 
		margin-top: 2px;
	}
</style>