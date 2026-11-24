<script>
	import { formatMoneyString } from '../polyfill';
	import { getContext } from 'svelte'
    import { MonthIdentifier } from '../types';
	const App = getContext('App')

	export let asset;
</script>

<div class='asset panel' class:depreciated={asset.isDepreciated}>
	<div class='title'>{asset.name}</div>
	<div class='dateRange'>{new MonthIdentifier().setFromDate(asset.startDate).shortName} - {asset.expectedDepreciationMonth.shortName}</div>

	<div class="valueInfo">
		<div class="label">Value <br>(initial/current)</div>
		<div class="value">
			{formatMoneyString(asset.initialValue, true, false)}/{formatMoneyString(asset.currentValue, true, false)}
		</div>
	</div>
	
	<div class="deprecationRate">
		<div class="label">Deprecation rate<br>(month)</div>
		<div class="value">
			{ #if (asset.depreciationMode == "fixed") }
				{formatMoneyString(asset.fixedDepreciationRate, true, false)}
			{:else}

			{/if}
		</div>
	</div>
	
	
	
	<!-- <div on:click={() => App.transactionViewerPopup.open(asset.transactions, asset.name + ' transactions')}>{asset.transactions.length} Transactions</div> -->
</div>


<style>
	.asset {
		position: relative;
		padding: 20px;
		
		background: #fff;
		box-shadow: 5px 5px 20px 10px rgba(0, 0, 0, .03);
		overflow: hidden;
		cursor: pointer;

		display: grid;
		grid-template-areas: 
			"title dateRange"
			"valueInfo deprecationRate";
		grid-template-rows: 30px auto;
		grid-template-columns: auto auto;
		gap: 20px;

	}
	.panel .title {
		grid-area: title;
		position: relative;
		color: #444;
		height: 20px;
		line-height: 20px;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.dateRange {
		grid-area: dateRange;
		font-size: 12px;
		color: #666;
	}

	.deprecationRate {
		grid-area: deprecationRate;
	}
	.valueInfo {
		grid-area: valueInfo;
	}
	.deprecationRate, .valueInfo {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.deprecationRate .label,
	.valueInfo .label {
		font-size: 10px;
		text-transform: uppercase;
	}
	.deprecationRate .value,
	.valueInfo .value {
		color: #333;
		font-size: 20px;
	}



	.infoHolder {
		z-index: 10;
		background-color: #fff;
		position: relative;
		padding: 20px;
		height: auto;

		border-top: none;
	}

		

</style>