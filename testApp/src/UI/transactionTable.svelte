<script>
	import Transaction from "./Transaction.svelte";
	export let transactions = [];
</script>

<table class='transactionTable'>
	<thead>
		<tr class='header'>
			<th scope='col'>Date</th>
			<th scope='col'>Money</th>
			<th scope='col'>Type</th>
			<th scope='col'>Target</th>
			<th scope='col'>Description</th>
		</tr>
	</thead>
	<tbody>
		{#each transactions as transaction}
			<Transaction {transaction}></Transaction>
		{/each}
	</tbody>
</table>

<style>
	.transactionTable {
		position: relative;
		overflow-y: auto;
		overflow-x: hidden;
		border-collapse: collapse;
	}

	th {
		position: relative;
		height: 20px;
		line-height: 20px;
		font-size: 13px;
		color: #444;
		text-align: left;
	}
</style>