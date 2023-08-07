<script>
	import Page from "../UI/page.svelte";
</script>

<Page title="Upload CSV">
	<input type='file' class='CSVInputField' accept='text/csv'>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class='button' on:click={() => {TransactionManager.clear(); App.uploadCSVPage.open()}}>
		Clear Data
	</div>
	<div class='transactionCountHolder textHolder'>
		Transactions: 0
	</div>
</Page>

<style>
	.CSVInputField {
		margin: 20px;
		width: calc(100% - 20px * 2);
		height: calc(100vh - 50px * 2 - 50px - 200px);

		border: 1px solid #ddd;
		text-align: center;
		padding: 50px;
		border: 1px solid #daf;
	}
</style>