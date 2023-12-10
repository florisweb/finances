<script>
	import Page from "../UI/page.svelte";	
	import Graph from "../UI/graph.svelte";
	import AccountManager from "../data/accountManager";
	import { AvailableColors } from '../color';
	import Vector from "../vector";

	let accounts = [];
	AccountManager.dataStore.subscribe((_accounts) => accounts = _accounts);
	let graphData = [{color: AvailableColors[0].color, data: [], doNotInterpolate: false}];

	
	$: if (accounts.length) {
		for (let i = 1; i < accounts.length + 1; i++)
		{
			graphData[i] = {
				color: AvailableColors[i].color,
				data: accounts[i - 1].generateGraphData(23) || [],
				doNotInterpolate: true,
			}
		}

		for (let d = 0; d < graphData[1].data.length; d++)
		{
			graphData[0].data[d] = new Vector(graphData[1].data[d].value[0], 0);
			for (let i = 1; i < accounts.length + 1; i++)
			{	
				graphData[0].data[d].value[1] += graphData[i].data[d].value[1];
			}
		}
	}
</script>

<Page>
	<div class='infoHolder'>
	</div>

	<div class='dataHolder'>
		<Graph title='Balance' data={graphData}></Graph>
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
		
		.balanceHolder {
			position: relative;
			font-size: 40px;
			height: 70px;
			line-height: 70px;
			color: #333;
			font-style: italic;
			padding-right: 20px;
		}
		.balanceHolder.positive {
			color: #383;
		}
		.balanceHolder.negative {
			color: #833;
		}

			.balanceHolder:before {
				content: 'CHANGE';
				position: absolute;
				top: 25px;
				right: 20px;
				font-size: 12px;
				white-space: nowrap;
			}



		.monthHolder {
			position: relative;
			display: flex;
			font-size: 40px;
			height: 70px;
			line-height: 70px;
			color: #333;
			font-style: italic;
			margin-right: 60px;
			padding-right: 20px;
		}
		


		.floatRightHolder {
			position: absolute;
			float: right;
			top: 15px;
			right: 0;
			height: 80px;
			display: flex;
		}
		
			.navigationHolder {
				position: relative;
				display: flex;
				white-space: nowrap;
				top: 25px;
				height: 37px;
				padding-left: 10px;
			}
			.navigationHolder .navButton {
				font-style: normal;
				cursor: pointer;
				font-size: 25px;
				margin-left: 5px;

				-webkit-touch-callout: none; /* iOS Safari */
				-webkit-user-select: none; /* Safari */
				-khtml-user-select: none; /* Konqueror HTML */
				-moz-user-select: none; /* Firefox */
					-ms-user-select: none; /* Internet Explorer/Edge */
						user-select: none; /* Non-prefixed version, currently
											supported by Chrome and Opera */
			}
			.navigationHolder .navButton:not(:nth-child(2)) {
				line-height: 14px;
			}
		
			.navigationHolder .navButton:nth-child(2) {
				font-size: 14px;
			}

		


			.buttonHolder {
				flex-direction: column;
			}
				.buttonHolder .buttonWrapper {
					margin-bottom: 5px;
					margin-top: 0;
					text-align: right;
					transition: .3s opacity, .3s margin-top;
				}
				.buttonHolder.noAssignableTransactions .buttonWrapper:not(.assignTransactions) {
					margin-top: 25px;
				}
				.buttonHolder.noAssignableTransactions .buttonWrapper.assignTransactions {
					opacity: 0;
					margin-top: -50px;
					pointer-events: none;
				}

</style>