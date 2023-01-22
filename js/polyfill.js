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


function wait(_dt) {
	return new Promise((resolve) => {
		setTimeout(resolve, _dt);
	});
}



Date.prototype.fromString = function(_str) {
	if (typeof _str != "string" || !_str) return _str;
	let dateTime = _str.split(" ");	
	let dateParts = dateTime[0].split("-");
	let date = new Date(parseInt(dateParts[1]) + "/" + parseInt(dateParts[0]) + "/" + parseInt(dateParts[2]));
	// this.setMonth(parseInt(dateParts[1]) - 1);

	if (!dateTime[1]) return date;
	let timeParts = dateTime[1].split(":");
	date.setHours(timeParts[0]);
	date.setMinutes(timeParts[1]);
	
	return date;
}


function downloadCSV(_string) {
	var c = document.createElement("a");
	c.download = "output.csv";

	var t = new Blob([_string], {
		type: "text/csv"
	});
	c.href = window.URL.createObjectURL(t);
	c.click();
}