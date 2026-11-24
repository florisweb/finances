import DataManager from "./dataManager";
import { Asset, MonthIdentifier } from '../types';

const AssetManager = new class extends DataManager {
	constructor() {
		super({type: "assets", dataToObject: _asset => new Asset(_asset)});
		window.AssetManager = this;
	}


	getById(_id) {
		return this._data.find((_item) => _item.id === _id);
	}


	add(_assets) {
		if (typeof _assets.length !== 'number') _assets = [_assets];
		for (let asset of _assets) 
		{
			let index = this._data.findIndex((_asset) => _asset.id === asset.id);
			if (index !== -1) 
			{
				this._data[index] = asset;
				continue;
			}
			this._data.push(asset);
		}
		return this.writeData();
	}

	remove(_assetId) {
		this._data = this._data.filter((_asset) => _asset.id !== _assetId);
		return this.writeData();
	}
}

export default AssetManager;