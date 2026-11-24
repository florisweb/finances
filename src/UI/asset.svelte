<script>
	import { formatMoneyString } from '../polyfill';
	import { getContext } from 'svelte'
    import { MonthIdentifier } from '../types';
	const App = getContext('App')

	export let asset;
</script>

<!-- panel isRow -->
<div class='asset isRow' class:depreciated={asset.isDepreciated}>
	<div class='title'>{asset.name}</div>
	<div class='dateRange'>{new MonthIdentifier().setFromDate(asset.startDate).shortName} - {asset.expectedDepreciationMonth.shortName}</div>

	<div class="valueInfo" on:click={() => App.transactionViewerPopup.open(asset.transactions, asset.name + ' transactions')}>
		<div class="label">Value <br>(initial/current)</div>
		<div class="value">
			{formatMoneyString(asset.initialValue, true, false)}/{formatMoneyString(asset.currentValue, true, false)}
		</div>
	</div>
	
	<div class="deprecationRate">
		<div class="label">Deprecation rate<br>(month)</div>
		<div class="value">
			{ #if asset.depreciationMode == "fixed" }
				{formatMoneyString(asset.fixedDepreciationRate, true, false)}
			{:else if asset.depreciationMode == "percentage" }
				{Math.round(asset.percentageDepreciationRate * 1000)/10}%
			{/if}
		</div>
	</div>
</div>


<style>
	.asset {
		position: relative;
		overflow: hidden;
		cursor: pointer;

		display: grid;
		
		gap: 20px;

		min-width: 350px;
	}
	.asset.panel {
		padding: 20px;
		
		background: #fff;
		box-shadow: 5px 5px 20px 10px rgba(0, 0, 0, .03);
		grid-template-areas: 
			"title dateRange"
			"valueInfo deprecationRate";
		grid-template-rows: 30px auto;
		grid-template-columns: auto auto;
	}

	.asset.isRow {
		grid-template-areas: 
			"title dateRange valueInfo deprecationRate";
		grid-template-rows: 50px;
		grid-template-columns: 1fr 1fr 1fr auto;
		width: 100%;
	}

	.asset.depreciated > * {
		opacity: .2;
		transition: opacity .4s;
	}
	.asset.depreciated:hover > * {
		opacity: 1;
	}

	.title {
		grid-area: title;
		position: relative;
		color: #444;
		height: 20px;
		line-height: 20px;
		text-transform: uppercase;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
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