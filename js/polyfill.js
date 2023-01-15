let $ = function () {return document.querySelectorAll(...arguments)}


function createElement(_tag, _class) {
	let element = document.createElement(_tag);
	element.className = _class;
	return element;
}

function setTextToElement(element, text) {
	element.innerHTML = "";
	let a = document.createElement('a');
	a.text = text;
	element.append(a);
}
