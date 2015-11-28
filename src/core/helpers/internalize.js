"use strict";

module.exports = function internalize(object, keys) {
	for(const key of keys) {
		if(object.hasOwnProperty(key))
			return;

		const desc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(object), key);

		if(desc) {
			desc.enumerable = true;
			Object.defineProperty(object, key, desc);
		}
	}

	return object;
};
