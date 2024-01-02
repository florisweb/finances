import { readonly, writable } from 'svelte/store';
import Packager from './data/packager';

const openPageIndexSetterStore = writable(4);
export let openPageIndexStore = readonly(openPageIndexSetterStore);
export let openPageByIndex = openPageIndexSetterStore.set;

window.openPageByIndex = openPageIndexSetterStore.set;


window.Packager = Packager;