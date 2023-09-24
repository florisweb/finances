export default class Color {
  #InvalidStr_responseValue = [0, 0, 0, 0];
  value = this.#InvalidStr_responseValue;
  constructor(_str) {
    this.value = this.#setColorValue(_str);
  }
  get id() {
    return this.RGBA;
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
export let AvailableColors = [
  {color: new Color('rgba(0, 0, 0, 0)'), name: '---'},
  {color: new Color('rgb(222, 131, 68)'), name: 'Red'},
  {color: new Color('rgb(245, 194, 66)'), name: 'Orange'},
  {color: new Color('rgb(245, 230, 66)'), name: 'Yellow'},
  {color: new Color('rgb(104, 52, 154)'), name: 'Purple'},
  {color: new Color('rgb(136, 150, 174)'), name: 'Blueish Gray'},
  {color: new Color('rgb(106, 153, 208)'), name: 'Blue'},
  {color: new Color('rgb(158, 205, 251)'), name: 'Light Blue'},
  {color: new Color('rgb(126, 171, 85)'), name: 'Moss Green'},
  {color: new Color('rgb(117, 251, 106)'), name: 'Green'},
  {color: new Color('rgb(117, 251, 189)'), name: 'Aqua'},
  {color: new Color('rgb(230, 50, 247)'), name: 'Pink'},
  {color: new Color('rgb(219, 225, 240)'), name: 'Light Gray'},
  {color: new Color('rgb(128, 128, 128)'), name: 'Dark Gray'},
];