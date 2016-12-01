"use strict";

const { MixinFactory } = require("@runnr/mixin");

const UpdateEmitter = require("../events/UpdateEmitter");

const insert = Symbol("insert");
const del = Symbol("delete");

function afterStoreLoaded(exec, store) {
	return store.collection
		? Promise.resolve(exec(store.collection))
		: store.loaded.then(() => afterStoreLoaded(exec, store));
}

const Persistable = MixinFactory(store => superclass => class Persistable extends superclass {
	constructor() {
		super(...arguments);

		Object.defineProperty(this, "persist", {
			enumerable: false,
			value: this.persist.bind(this)
		});

		this[insert] = this[insert].bind(this);
		this[del] = this[del].bind(this);

		if(this instanceof UpdateEmitter) {
			this.on("update", this.persist);
			this.on("delete", this[del]);
		}
	}

	persist() {
		if(!("$loki" in this && "meta" in this))
			return Promise.resolve();

		return afterStoreLoaded(collection => collection.update(this), store);
	}

	[insert]() {
		return afterStoreLoaded(collection => collection.insert(this), store);
	}

	[del]() {
		if(!("$loki" in this && "meta" in this))
			return Promise.resolve();

		return afterStoreLoaded(collection => collection.remove(this), store);
	}
});

Object.assign(Persistable, {
	insert,
	delete: del
});

module.exports = Persistable;
