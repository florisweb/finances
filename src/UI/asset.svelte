<script>
	import { formatMoneyString } from '../polyfill';
	import { getContext } from 'svelte'
	const App = getContext('App')

	export let asset;
</script>

<div class='asset'>
	{asset.name}
	Initial: {formatMoneyString(asset.initialValue, true, false)}
	Current: {formatMoneyString(asset.currentValue, true, false)}

	Depreciation: {asset.depreciationMode}
	Rate: {formatMoneyString(asset.fixedDepreciationRate, true, false)}/month
	
	<div on:click={() => App.transactionViewerPopup.open(asset.transactions, asset.name + ' transactions')}>{asset.transactions.length} Transactions</div>
</div>


<style>

</style>