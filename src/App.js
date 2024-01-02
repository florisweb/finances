import { readonly, writable } from 'svelte/store';
import Packager from './data/packager';
import TransactionManager from './data/transactionManager';	

const openPageIndexSetterStore = writable(4);
export let openPageIndexStore = readonly(openPageIndexSetterStore);
export let openPageByIndex = openPageIndexSetterStore.set;


if (TransactionManager.data.length === 0) openPageByIndex(0);
window.openPageByIndex = openPageIndexSetterStore.set;


window.Packager = Packager;
