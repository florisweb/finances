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
	/* INFOHOLDER */
	.infoHolder {
		position: relative;
		display: flex;
		margin-left: 20px;
		width: calc(100% - 40px);
		height: auto;

		padding: 20px 0;
		border-bottom: 1px solid #ddd;
	}
		.titleHolder {
			position: relative;
			display: flex;
			height: 70px;
			margin-right: 10px;
			
			line-height: 70px;
			color: #333;
			font-style: italic;
			font-size: 40px;
			text-transform: uppercase;
		}
			.titleHolder .subInfoHolder {
				position: absolute;
				top: 25px;
				right: 0;
				font-size: 12px;
				white-space: nowrap;
			}
		

		.deltaHolder {
			position: relative;
			display: flex;
			margin-top: 6px;
			margin-right: 15px;
			
			height: 60px;
			flex-direction: row;
			background-color: #ccc;
			border-radius: 5px;
			padding: 0 10px;
			color: #fff;
		}
		
		.deltaHolder.positive {
			background-color: #3c3;
		}
		.deltaHolder.negative {
			background-color: var(--NegativeColor);
		}

		.deltaHolder .deltaIcon {
			height: 60px;
			padding: 10px 0;
			margin-right: 5px;
		}
		.deltaHolder .deltaMoney {
			position: relative;
			display: flex;
			height: 50px;
			min-width: 75px;
			
			line-height: 45px;
			font-style: italic;
			font-size: 30px;
		}

		.deltaHolder .deltaMoney:before {
			content: 'PER MONTH';
			position: absolute;
			top: 25px;
			right: 2px;
			font-size: 12px;
			white-space: nowrap;
		}





		.floatRightHolder {
			position: absolute;
			float: right;
			top: 15px;
			right: 0;
			height: 80px;
			display: flex;
		}
	

			.buttonHolder .buttonWrapper {
				position: relative;
				top: 50%;
				transform: translateY(-50%);
				text-align: right;
				transition: .3s opacity, .3s margin-right;
			}
			.buttonHolder.noAssignableTransactions .buttonWrapper {
				opacity: 0;
				margin-right: -20px;
				pointer-events: none;
			}


	.dataHolder {
		margin-top: 30px;
		margin-left: 20px;


		display: grid;
		grid-template: 
			'distribution distribution'
			'expensesTags incomeTags'
			'tags budget';
		grid-template-columns: 50% 50%;
	}

	.dataHolder .section.distribution {
		grid-area: distribution;
		display: flex;
		justify-content: space-between;
		border-bottom: 1px solid #eee;
	}
	





	
	.dataHolder .section.expensesTags {
		margin-top: 20px;
		grid-area: expensesTags;
	}
	.dataHolder .section.incomeTags {
		margin-top: 20px;
		grid-area: incomeTags;

	}


		.section.incomeTags {
			padding-left: 30px;
		}

		.section.expensesTags .tagTable,
		.section.incomeTags .tagTable {
			font-size: 13px;
			width: 100%;
		}	

		
		.section.expensesTags .tagTable {
			border-right: 1px solid #eee;
			padding-right: 30px;
		}
	

		.section .tagTable .tableTitle {
			text-transform: uppercase;
		}

		.section .tagTable .header th {
			text-align: left;
			font-size: 13px;
			padding-bottom: 5px;
		}
		
		.section .tagTable td {
			line-height: 22px;
		}
		.section .tagTable td.placeholder {
			color: #aaa;
		}

		.tagTable .moneyString.negative {
			color: var(--NegativeColor);
		}
		
</style>