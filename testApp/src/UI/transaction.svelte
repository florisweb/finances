<script>
	import { formatMoneyString } from '../polyfill';
	import TagSelectDropDown from './tagSelectDropDown.svelte';
	import TagManager from '../data/tagManager';

	export let date;
	export let description = 'No description...';
	export let targetIBAN;
	export let targetName;
	export let deltaMoney = 0;
	export let classificationState = 0; // 0: not classified, 1: autoclassified, 2: manually classified
	export let typeCode = 0;
	// export let transactionTag;

	let curTag;
	$: curTag = TagManager.getById(typeCode);
</script>


<tr class={'transaction' + (' classificationState_' + classificationState)}>
	<td class='dateTD'>{date}</td>
	<td class='moneyTD'>{formatMoneyString(deltaMoney)}</td>
	<td><TagSelectDropDown value={curTag}></TagSelectDropDown></td>
	<td>{targetName + (targetIBAN ? ` (${targetIBAN})` : '')}</td>
	<td>{description}</td>
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
	td.dateTD {
		min-width: 100px;
	}
	td.moneyTD {
		white-space: nowrap;
		overflow-wrap: unset;
	}
	

	.classificationState_0 td:first-child {
		border-left: 3px solid transparent;
	}
	.classificationState_1 td:first-child {
		border-left: 3px solid red;
	}
	.classificationState_2 td:first-child {
		border-left: 3px solid #daf;
	}
</style>