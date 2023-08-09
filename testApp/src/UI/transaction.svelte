<script>
	import { formatMoneyString } from '../polyfill';
	import TagSelectDropDown from './tagSelectDropDown.svelte';
	import TransactionManager from '../data/transactionManager';

	export let transaction;
</script>

<tr class={'transaction' + (' classificationState_' + transaction.classificationState)}>
	<td><div class='dateHolder'>{transaction.date}</div></td>
	<td class='moneyTD'>{formatMoneyString(transaction.deltaMoney)}</td>
	<td><TagSelectDropDown value={transaction.typeCode} on:change={(_event) => {
			transaction.typeCode = _event.detail || transaction.typeCode;
			transaction.classificationState = 2;
			transaction.update() // Updates the transaction
		}
	}></TagSelectDropDown></td>
	<td>{transaction.targetName + (transaction.targetIBAN ? ` (${transaction.targetIBAN})` : '')}</td>
	<td>{transaction.description}</td>
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