"use strict";

const itemMap = new WeakMap();
const dbItem = Symbol("dbItem");

class StoreItem {
	constructor(item, onNewItem) {
		if(this.constructor === StoreItem)
			throw new Error("StoreItem cannot be instanciated directly.");

		if(!item || typeof item !== "object")
			throw new TypeError("StoreItem can only manage objects.");

		const res = itemMap.get(item);

		if(res)
			return res;

		itemMap.set(item, this);

		this[dbItem] = item;

		if(typeof onNewItem === "function")
			onNewItem.call(this);
	}

	static delete(item) {
		itemMap.delete(item);
	}
}

StoreItem.dbItem = dbItem;

module.exports = StoreItem;
