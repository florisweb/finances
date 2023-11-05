<script>
	import Button from "../UI/button.svelte";
	import Page from "../UI/page.svelte";
	import { openPageByIndex } from '../App';
	import { getContext } from 'svelte';
	const App = getContext('App');


	let curTag;
	App.tagPage = {
		open: (_tag) => {
			curTag = _tag;
			openPageByIndex(6);
		}
	};

	let transactions = [];
	$: transactions = curTag?.transactions ?? [];
</script>

<Page title={curTag?.name}>
	<Button on:click={() => App.transactionViewerPopup.open(transactions)} name={`All transactions [${transactions.length}]`}></Button>
	<Button on:click={() => App.createTagPopup.openEdit(curTag)} name='Edit'></Button>
</Page>