<script>
	import Page from "../UI/page.svelte";
	import { MonthIdentifier } from "../types";
	import TagManager from '../data/tagManager';
    import TagOverviewPanel from "../UI/tagOverviewPanel.svelte";

	export let curMonth = new MonthIdentifier();


	let tags = [];
	TagManager.dataStore.subscribe((_tags) => tags = _tags);

	let totalDelta = 50;
</script>

<Page>
	<div class='infoHolder'>
		<!-- <div class={'monthSuccessIndicator' + (totalDelta > 0 ? ' positive' : (totalDelta < 0 ? ' negative' : ''))}>{(totalDelta > 0 ? '+' : '') + totalDelta}</div> -->
		<div class='monthHolder'>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class='navButton' on:click={() => curMonth = new MonthIdentifier().setFromDate(curMonth.date.moveMonth(-1))}>‹</div> 
			<div>{curMonth.name}</div>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class='navButton' on:click={() => curMonth = new MonthIdentifier().setFromDate(curMonth.date.moveMonth(1))}>›</div> 
		</div>

	</div>

	<div class='tagListHolder'>
		{#each tags as tag}
			<TagOverviewPanel {...tag}></TagOverviewPanel>
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
		.monthSuccessIndicator {
			position: relative;
			height: 80px;
			width: auto;

			padding: 10px;

			font-size: 30px;
			line-height: 50px;
			text-align: center;
			color: #333;

			border: 3px solid #f00;

			margin-right: 20px;
		}
		.monthSuccessIndicator.positive {
			color: #3a3;
		}
		.monthSuccessIndicator.negative {
			color: #a33;
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
		.monthHolder .navButton {
			font-style: normal;
			color: #999;
			cursor: pointer;
			margin: 0 5px;
		}

	

		.balanceHolder {
			position: relative;
			font-size: 40px;
			height: 70px;
			line-height: 70px;
			color: #333;
			font-style: italic;
			margin-right: 60px;
			padding-right: 20px;
		}



		.balanceHolder:before {
			content: 'CURRENT BALANCE';
			position: absolute;
			top: 25px;
			right: 20px;
			font-size: 12px;
			white-space: nowrap;
		}





	/* Tag List */
	.tagListHolder {
		position: relative;
		margin: 20px;

		display: grid;
		grid-template: repeat(10, auto) / repeat(3, calc((100% - 40px * 2) / 3));
		grid-gap: 40px;
	}


</style>