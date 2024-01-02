import DataManager from "./dataManager";
import { TransactionTag, SavingsTransactionTag, NonAssignedTag } from "../types";


const TagManager = new class extends DataManager {
	constructor() {
		super({type: "tags", dataToObject: function (_tag) {
			if (_tag.isSavingsTag) return new SavingsTransactionTag(...arguments);
			return new TransactionTag(...arguments);
		}});
		window.TagManager = this;
	}
	getById(_id) {
		return this._data.find((_tag) => _tag.id === _id);
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

	remove(_tagId) {
		let tag = this.getById(_tagId);
		let transactions = tag.transactions;
		for (let t of transactions) t.typeCode = 0;

		this._data = this._data.filter((_tag) => _tag.id !== _tagId);
		return this.writeData();
	}

	_setStore(_tags) {
		return super._setStore([..._tags, new NonAssignedTag()]);
	}


	autoDetectTransactionTag(_transaction) {
		for (let tag of this._data)
		{
			if (!tag.transactionFitsTag(_transaction)) continue;
			return tag;
		}
		return false;
	}
}

export default TagManager;