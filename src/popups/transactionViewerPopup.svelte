<script>
	import Popup from "./popup.svelte";
	import Header from "../UI/header.svelte";
	import TransactionTable from '../UI/transactionTable.svelte';
	import SearchField from '../UI/searchField.svelte';
    import Button from "../UI/button.svelte";
	import { wait } from "../polyfill";


	const transactionsPerPage = 50;


	let isOpen = false;
	let transactions = [];
	let title = 'Transaction viewer';

	let pages = [];
	let curPageTransactions = [];
	let curPageIndex = 0;
	$: if (transactions) filterTransactions(false);

	function updatePages(_transactions) {
		pages = [];
		for (let i = 0; i < _transactions.length; i += transactionsPerPage)
		{
			pages = [...pages, _transactions.slice(i, i + transactionsPerPage)];
		}
	}

	$: curPageTransactions = pages[curPageIndex] || [];

	export function open(_transactions, _customTitle) {
		isOpen = true;
		transactions = Object.assign([], _transactions); // Keep references to the items intact, but destroy the reference to the array so it can be resorted without affecting the rest of the application
		transactions.sort((a, b) => a.date.getTime() < b.date.getTime());
		title = _customTitle ?? 'Transaction Viewer';
		curPageIndex = 0;
	}
	export async function close() {
		isOpen = false;
		await wait(300);
		curPageTransactions = [];
	}

	function filterTransactions(_filterString) {
		if (!_filterString) {
			transactions.sort((a, b) => a.date < b.date);
			updatePages(transactions);
			curPageIndex = 0;
			return;
		}
		const tagParts = _filterString.split('#');
		let tagSearchParts = tagParts.map(r => r.split(' ')[0]).slice(1)
		const targetParts = _filterString.split('@');
		let targetSearchParts = targetParts.map(r => r.split(' ')[0]).slice(1)

		let desciptionString = _filterString;
		for (let part of [...tagSearchParts.map(r => '#' + r), ...targetSearchParts.map(r => '@' + r)])
		{
			desciptionString = desciptionString.replaceAll(part, '');
		}

		transactions.forEach((trans) => {
			let tagScore = 0;
			if (trans.tag) for (let tagPart of tagSearchParts) tagScore += similarity(tagPart, trans.tag?.name);
			let targetScore = 0;
			for (let targetPart of targetSearchParts) targetScore += similarity(targetPart, trans.targetName + trans.targetIBAN);

			const descriptionScore = desciptionString ? similarity(trans.description + ' ' + trans.userNote, desciptionString) : 0;
			trans.searchScore = tagScore * 0.5 + targetScore * 0.5 + descriptionScore;
		})

		transactions.sort((a, b) => a.date > b.date);
		transactions.sort((a, b) => a.searchScore < b.searchScore);

		updatePages(transactions);
		curPageIndex = 0;
	}



	// https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely
	function similarity(s1, s2) {
		var longer = s1;
		var shorter = s2;

		if (s1.length < s2.length) {
			longer = s2;
			shorter = s1;
		}

		var longerLength = longer.length;
		if (longerLength == 0) {return 1.0;}

		// return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
		return (longerLength - editDistance(longer, shorter)) * parseFloat(longerLength)**(-0.5);


		function editDistance(s1, s2) {
			s1 = s1.toLowerCase();
			s2 = s2.toLowerCase();

			var costs = new Array();
			for (var i = 0; i <= s1.length; i++) {
			var lastValue = i;
			for (var j = 0; j <= s2.length; j++) {
				if (i == 0)
				{
					costs[j] = j;
				} else {
					if (j > 0) {
						var newValue = costs[j - 1];
						if (s1.charAt(i - 1) != s2.charAt(j - 1))
						newValue = Math.min(Math.min(newValue, lastValue),
						costs[j]) + 1;
						costs[j - 1] = lastValue;
						lastValue = newValue;
					}
				}
			}
			if (i > 0)
			costs[s2.length] = lastValue;
			}

			return costs[s2.length];
		}
	}
</script>

<Popup {isOpen} customClass='TransactionViewerPopup' on:passiveClose={() => isOpen = false}>
	<Header slot='header' title={title}></Header>
	<div class="searchFieldHolder">
		<SearchField on:input={(e) => filterTransactions(e.detail)} on:click={(e) => filterTransactions(e.detail)}></SearchField>
	</div>
	<div class='transactionHolder'>
		{#if (curPageTransactions.length === 0)}
			<div class='noTransactionsText'>No Transactions to show</div>
		{:else}
			<TransactionTable transactions={curPageTransactions}></TransactionTable>
		{/if}
	</div>
	<div class='buttonHolder'>
		{#if pages.length > 1}
			<div class='navigatorHolder'>
				<Button name='<' on:click={() => curPageIndex > 0 ? curPageIndex-- : false} disabled={curPageIndex === 0}></Button>
				<Button name={`${curPageIndex + 1}/${pages.length}`} on:click={() => curPageIndex = 0}></Button>
				<Button name='>' on:click={() => curPageIndex < pages.length - 1 ? curPageIndex++ : false} disabled={curPageIndex === pages.length - 1}></Button>
			</div>
		{/if}
		<Button name='Close' filled={true} on:click={close}></Button>
	</div>
</Popup>

<style>
	.buttonHolder {
		display: flex;
		flex-direction: row-reverse;
	}

	.navigatorHolder {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
	}

	.transactionHolder {
		margin-top: 3px;
		padding-top: 10px;
		padding-bottom: 10px;
		max-height: calc(90vh - 100px);
		overflow: auto;
	}
	.noTransactionsText {
		text-align: center;
		width: 100%;
		padding: 50px;
		font-size: 20px;
	}

	.searchFieldHolder {
		position: absolute;
		right: 30px;
		top: 20px;
		width: 20%;
	}
</style>