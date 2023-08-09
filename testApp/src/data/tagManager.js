import DataManager from "./dataManager";
import { TransactionTag, SavingsTransactionTag, NonAssignedTag } from "../types";

const TagManager = new class extends DataManager {
	constructor() {
		super({type: "tags", dataToObject: function (_tag) {
			if (_tag.isSavingsTag) return new SavingsTransactionTag(...arguments);
			return new TransactionTag(...arguments);
		}});
	}
	getById(_id) {
		return this._data.find((_tag) => _tag.id === _id);
	}
	
	set(_tags) {
		this._data = _tags;
		return this.writeData();
	}

	add(_tags) {
		if (typeof _tags.length !== 'number') _tags = [_tags];
		for (let tag of _tags) 
		{
			let index = this._data.findIndex((_tag) => _tag.id === tag.id);
			if (index !== -1) 
			{
				this._data[index] = tag;
				continue;
			}
			this._data.push(tag);
		}
		return this.writeData();
	}

	_setStore(_tags) {
		return super._setStore([..._tags, new NonAssignedTag()]);
	}
}

export default TagManager;