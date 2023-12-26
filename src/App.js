import { readonly, writable } from 'svelte/store';	

const openPageIndexSetterStore = writable(4);
export let openPageIndexStore = readonly(openPageIndexSetterStore);
export let openPageByIndex = openPageIndexSetterStore.set;

window.openPageByIndex = openPageIndexSetterStore.set;

import Packager from './data/packager';
window.Packager = Packager;
