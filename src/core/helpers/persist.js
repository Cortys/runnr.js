"use strict";

module.exports = function persist(object) {
	if(!("$loki" in object && "meta" in object))
		return Promise.resolve();

	return object.constructor.store.collection
		? Promise.resolve(object.constructor.store.collection.update(object))
		: object.constructor.store.loaded.then(() => persist(object));
};
