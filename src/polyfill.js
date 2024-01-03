

export function formatMoneyString(_money, _addEuroSign = true, _ignoreCents = false) {
	let moneyString = String(Math.round(_money * 100) / 100);
	let parts = moneyString.split('.');
	if (!_ignoreCents)
	{
		if (parts.length === 1) moneyString += '.00';
		if (parts.length === 2) moneyString = parts[0] + '.' + (parts[1].length === 1 ? parts[1] + '0' : parts[1]);
	} else moneyString = parts[0];
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


export function downloadFile(_string, _name = 'output.csv', _type = 'text/csv') {
	var c = document.createElement("a");
	c.download = _name;

	var t = new Blob([_string], {type: _type});
	c.href = window.URL.createObjectURL(t);
	c.click();
}


export function isDescendant(parent, child) {
	if (typeof parent.length !== "number") return _isDescendant(parent, child);
	for (let i = 0; i < parent.length; i++)
	{
	  if (_isDescendant(parent[i], child)) return true;
	}
  
	function _isDescendant(parent, child) {
	  if (parent == child) return true;
	  
	   var node = child.parentNode;
	   while (node != null) 
	   {
		   if (node == parent) return true;
		   node = node.parentNode;
	   }
	   return false;
	}
  }