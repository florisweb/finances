<script>
	import { formatMoneyString } from '../polyfill';
	export let transaction;
	
</script>

<tr class={'transaction' + (' classificationState_' + transaction.classificationState)}>
	<td><div class='dateHolder'>{transaction.date}</div></td>
	<td class='moneyTD'>{formatMoneyString(transaction.deltaMoney)}</td>
	<td>{Math.round(transaction.shares * 100) / 100}</td>
	<td>{formatMoneyString(transaction.sharePriceAtTimeOfTransaction)}</td>
	<td>{transaction.fund}</td>
</tr>


<style>
	.transaction:not(:last-child) {
		border-bottom: 1px solid #ddd;
	}

	td {
		position: relative;
		height: 20px;
		line-height: 20px;
		font-size: 13px;
		color: #444;
		
		padding-top: 10px;
		padding-bottom: 10px;
	}
	td:not(:last-child) {
		padding-right: 10px;
	}
	td.moneyTD {
		white-space: nowrap;
		overflow-wrap: unset;
	}

	td.tagSelector {
		display: flex;
		flex-direction: row;
	}
	td.tagSelector .predictedTagButton {
		height: 35px;
		padding: 7.5px;
		padding-left: 10px;
		padding-right: 5px;

		line-height: 20px;
		white-space: nowrap;
		cursor: pointer;
		max-width: 140px;
		overflow: hidden;
		text-overflow: ellipsis;
	}


	.dateHolder {
		position: relative;
		min-width: 100px;
		height: 30px;
		line-height: 20px;
		padding: 5px 0;
		padding-left: 7px;

		border-left: 3px solid transparent;
		transition: .2s border-left-color;
	}
	.classificationState_1 .dateHolder {
		border-left-color: red;
	}
	.classificationState_2 .dateHolder {
		border-left-color: #daf;
	}	
</style>