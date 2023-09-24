<script>
	import { formatMoneyString } from '../polyfill';
	export let money = 0;
	export let addEuroSign = true;
	export let boundaries = [-10, 10];
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<a class:negative={money < boundaries[0]} class:positive={money > boundaries[1]}>{formatMoneyString(money, addEuroSign)}</a> 

<style>
	.negative {
		color: #844;
	}
	.positive {
		color: #484;
	}
</style>