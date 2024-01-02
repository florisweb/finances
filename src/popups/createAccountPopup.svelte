<script>
	import Popup from "./popup.svelte";
	import Header from "../UI/header.svelte";
    import Input from "../UI/input.svelte";
	import Button from "../UI/button.svelte";

	import { BankAccount } from "../types";
    import AccountManager from "../data/accountManager";

	let isOpen = false;
	let curAccount = new BankAccount({
		name: null,
		IBAN: null,
	});

	export async function close() {
		isOpen = false;
		// let result = await TransactionManager.autoClassifyTransactions();
		// App.statusMessage.open('Classified ' + result.newClassifies + ' new transactions (' + Math.round(result.classifies / TransactionManager.data.length * 1000) / 10 + '% classified)')
	}
	export function openEdit(_account) {
		isOpen = true;
		curAccount = _account.clone();
	}

	function save() {
		AccountManager.add(curAccount);
		close();
	}

	let nameInput;
	$: if (isOpen && nameInput) nameInput.focus();
</script>

<Popup {isOpen} on:passiveClose={() => isOpen = false} customClass='CreateTagPopup'>
	<Header slot='header' title='Edit Account'></Header>
	<br>
	<br>
	<Input on:input={(_event) => curAccount.name = _event.detail} value={curAccount.name} bind:element={nameInput}  placeholder='Account name...'></Input>
	<br>
	<br>
	<div class='buttonHolder'>
		<Button name='Save' on:click={() => save()}></Button>
		<Button name='Cancel' filled={false} on:click={() => close()}></Button>
	</div>
</Popup>


<style>
	.buttonHolder {
		display: flex;
		flex-direction: row-reverse;
	}
</style>