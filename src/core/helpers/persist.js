"use strict";

module.exports = function persist(object) {
	return object.constructor.store.collection
		? object.constructor.store.collection.update(object)
		: object.constructor.store.loaded.then(() => persist(object));
};
