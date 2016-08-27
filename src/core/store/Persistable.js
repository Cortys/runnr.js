"use strict";

const { Mixin } = require("mixwith");

function persist(object, store) {
	if(!("$loki" in object && "meta" in object))
		return Promise.resolve();

	return store.collection
		? Promise.resolve(store.collection.update(object))
		: store.loaded.then(() => persist(object, store));
}

module.exports = Object.assign(store => Mixin(superclass => class Persistable extends superclass {
	constructor() {
		super(...arguments);

		this.persist = () => persist(this, store);
	}
}), { persist });
