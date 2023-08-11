import { readonly, writable } from 'svelte/store';	

const openPageIndexSetterStore = writable(2);
export let openPageIndexStore = readonly(openPageIndexSetterStore);
export let openPageByIndex = openPageIndexSetterStore.set;
import BudgetManager from './data/budgetManager';
