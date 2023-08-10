

export function formatMoneyString(_money, _addEuroSign = true) {
	let moneyString = String(Math.round(_money * 100) / 100);
	let parts = moneyString.split('.');
	if (parts.length === 1) moneyString += '.00';
	if (parts.length === 2) moneyString = parts[0] + '.' + (parts[1].length === 1 ? parts[1] + '0' : parts[1]);
	if (!_addEuroSign) return moneyString;

	let negativeParts = moneyString.split('-');
	if (negativeParts.length === 2) return '-€' + negativeParts[1];
	return '€' + moneyString;
}


export function newId() {
	return String(Math.round(Math.random() * 1000000000000));
}

export function wait(_dt) {
	return new Promise((resolve) => {
		setTimeout(resolve, _dt);
	});
}