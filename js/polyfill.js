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





// https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely
function similarity(s1, s2) {
  var longer = s1;
  var shorter = s2;

  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }

  var longerLength = longer.length;
  if (longerLength == 0) {return 1.0;}

  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);


  function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
      var lastValue = i;
      for (var j = 0; j <= s2.length; j++) {
        if (i == 0)
        {
        costs[j] = j;
        } else {
          if (j > 0) {
            var newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
            costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0)
      costs[s2.length] = lastValue;
    }

    return costs[s2.length];
  }
}



function formatMoneyString(_money, _addEuroSign = true) {
	let moneyString = String(Math.round(_money * 100) / 100);
	let parts = moneyString.split('.');
	if (parts.length === 1) moneyString += '.00';
	if (parts.length === 2) moneyString = parts[0] + '.' + (parts[1].length === 1 ? parts[1] + '0' : parts[1]);
	if (!_addEuroSign) return moneyString;

	let negativeParts = moneyString.split('-');
	if (negativeParts.length === 2) return '-€' + negativeParts[1];
	return '€' + moneyString;
}

