

export default class Matrix {
	value = [];
	
	constructor(_width = 2, _height = 2, _defaultValue = 0) {
		for (let y = 0; y < _height; y++)
		{	
			this.value[y] = [];
			for (let x = 0; x < _width; x++)
			{
				this.value[y][x] = _defaultValue;
			}
		}
	}
	setFromMatrix(_matrix) {
		return this.fromArray(_matrix.value);
	}

	fromArray(_array) {
		this.value = [];
		for (let y = 0; y < _array.length; y++)
		{	
			this.value[y] = [];
			for (let x = 0; x < _array[0].length; x++)
			{
				this.value[y][x] = _array[y][x];
			}
		}
		return this;
	}



	copy() {
		return new Matrix().setFromMatrix(this);
	}
	print() {console.table(this.value)}

	export() {
		return this.value;
	}

	get width() {return this.value[0].length}
	get height() {return this.value.length}

	transpose() {
		let newWidth = this.height;
		let newHeight = this.width;

		let newValue = [];
		
		for (let y = 0; y < newHeight; y++)
		{	
			newValue[y] = [];
			for (let x = 0; x < newWidth; x++)
			{
				newValue[y][x] = this.value[x][y];
			}
		}

		this.value = newValue;
		return this;
	}

	add(_matrix) {
		if (_matrix.width !== this.width || _matrix.height !== this.height) return console.warn('Matrix: Error add operation only allowed with similarly sized matrices.');
		for (let y = 0; y < this.height; y++)
		{	
			for (let x = 0; x < this.width; x++)
			{
				this.value[y][x] += _matrix.value[y][x];
			}
		}	
		return this;
	}

	applyFunction(_f) {
		for (let y = 0; y < this.height; y++)
		{	
			for (let x = 0; x < this.width; x++)
			{
				this.value[y][x] = _f(this.value[y][x], x, y);
			}
		}
		return this;
	}

	scale(_factor) {
		return this.applyFunction((_v) => _v * _factor);
	}


	elementWiseMultiply(_matrix) {
		return this.applyFunction((v, x, y) => v * _matrix.value[y][x]);
	}

	multiply(_matrix) {
		// if (this.width !== _matrix.height || this.height)
		let newMatrix = new Matrix(_matrix.width, this.height, 0); // size correct

		for (let y = 0; y < newMatrix.height; y++)
		{	
			for (let x = 0; x < newMatrix.width; x++)
			{
				for (let k = 0; k < this.width; k++)
				{
					newMatrix.value[y][x] += this.value[y][k] * _matrix.value[k][x];
				}
			}
		}
		this.setFromMatrix(newMatrix);
		return this; 
	}

}


