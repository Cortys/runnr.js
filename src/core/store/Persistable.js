"use strict";

const MixinFactory = require("../helpers/MixinFactory");

function persist(object, store) {
	if(!("$loki" in object && "meta" in object))
		return Promise.resolve();

	return store.collection
		? Promise.resolve(store.collection.update(object))
		: store.loaded.then(() => persist(object, store));
}

const Persistable = MixinFactory(store => superclass => class Persistable extends superclass {
	constructor() {
		super(...arguments);

		this.persist = () => persist(this, store);
	}
});

Object.assign(Persistable, { persist });

module.exports = Persistable;
