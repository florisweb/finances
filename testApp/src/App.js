import { readonly, writable } from 'svelte/store';	

const openPageIndexSetterStore = writable(0);
export let openPageIndexStore = readonly(openPageIndexSetterStore);
export let openPageByIndex = openPageIndexSetterStore.set;

export const assignableTransactions = writable([]);

window.openPageByIndex = openPageIndexSetterStore.set;
