"use strict";

module.exports = function internalize(object, keys) {
	for(const key of keys) {
		if(object.hasOwnProperty(key))
			return;

		let proto = object;
		let desc;

		while(!desc && (proto = Object.getPrototypeOf(proto)))
			desc = Object.getOwnPropertyDescriptor(proto, key);

		if(desc) {
			desc.enumerable = true;
			Object.defineProperty(object, key, desc);
		}
	}

	return object;
};
