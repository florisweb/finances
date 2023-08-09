import DataManager from "./dataManager";
import { TransactionTag, SavingsTransactionTag } from "../types";

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
	
	set(_tags) {
		this._data = _tags;
		return this.writeData();
	}
}

export default TagManager;