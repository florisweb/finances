export default class Color {
  #InvalidStr_responseValue = [0, 0, 0, 0];
  value = this.#InvalidStr_responseValue;
  constructor(_str) {
    this.value = this.#setColorValue(_str);
  }

  copy() {
    return new Color(this.RGBA);
  }

  #setColorValue(_str) {
    if (!_str || typeof _str !== "string") return this.#InvalidStr_responseValue;
    if (_str.substr(0, 1) == "#") return this.#hexToValue(_str)
   
    let prefix = _str.split("rgba(");
  
    if (prefix.length < 2) prefix = _str.split("rgb(");
    let colors = prefix[1].substr(0, prefix[1].length - 1).split(",");

    return [
      parseFloat(colors[0]),
      parseFloat(colors[1]),
      parseFloat(colors[2]),
      colors[3] ? parseFloat(colors[3]) : 1
    ]
  }
 
  #hexToValue(hex) { // https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16),
      1
    ] : this.#InvalidStr_responseValue;
  }



  get RGB() {
    return "rgb(" + this.value[0] + ", " + this.value[1] + ", " + this.value[2] + ")";
  }

  get RGBA() {
    return "rgba(" + this.value[0] + ", " + this.value[1] + ", " + this.value[2] + ", " + this.value[3] + ")";
  }

  get hex() {
    return "#" + componentToHex(this.value[0]) + componentToHex(this.value[1]) + componentToHex(this.value[2]);

    function componentToHex(c) {
        var hex = Math.round(c).toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
  }


  merge(_color, _percentage = .5) {
    if (!_color) return false;
    for (let i = 0; i < this.value.length; i++)
    {
      this.value[i] = this.value[i] * _percentage + _color.value[i] * (1 - _percentage);
    }
    
    return this;
  }
}