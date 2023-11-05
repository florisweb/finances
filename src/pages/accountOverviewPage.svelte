<script>
	import Page from "../UI/page.svelte";	
	import Button from '../UI/button.svelte';
	import { formatMoneyString } from '../polyfill';

	import { openPageByIndex } from '../App';
	import { getContext } from 'svelte';
	const App = getContext('App');

	let curAccount;
	App.accountPage = {
		open: (_account) => {
			curAccount = _account;
			openPageByIndex(5);
		}
	};

</script>

<Page>
	<div class='infoHolder'>
		<div class='balanceHolder'>{formatMoneyString(curAccount?.balance ?? 0, true, true)}</div>
		
		<div class='titleHolder'>
			<div>{curAccount?.name || 'Unnamed'}</div>
			<div class="subInfoHolder">{curAccount?.IBAN}</div>
		</div>

		<div class="floatRightHolder">
			<div class={'buttonHolder'}>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<Button name='Transactions' 
					on:click={
					() => App.transactionViewerPopup.open(curAccount?.transactions, `${curAccount?.name}'s Transactions`)
				}></Button>

				<Button name='Edit' 
					on:click={
					() => App.createAccountPopup.openEdit(curAccount)
				}></Button>
			</div>
		</div>
	</div>

	<div class='tagListHolder'>
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
			.balanceHolder:before {
				content: 'BALANCE';
				position: absolute;
				top: 25px;
				right: 20px;
				font-size: 12px;
				white-space: nowrap;
			}



		.titleHolder {
			position: relative;
			display: flex;
			height: 70px;
			margin-right: 60px;
			padding-right: 20px;
			
			line-height: 70px;
			color: #333;
			font-style: italic;
			font-size: 40px;
			text-transform: uppercase;
		}
			.titleHolder .subInfoHolder {
				position: absolute;
				top: 25px;
				right: 25px;
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