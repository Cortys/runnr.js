"use strict";

const { Mixin } = require("mixwith");

function MixinFactory(factory) {
	const isInstance = Symbol("isInstance");

	return Object.defineProperty((...args) => {
		const mixin = Mixin(factory(...args));

		return superclass => {
			const applied = mixin(superclass);

			applied.prototype[isInstance] = true;

			return applied;
		};
	}, Symbol.hasInstance, {
		value: obj => obj && typeof obj === "object" && obj[isInstance]
	});
}

module.exports = MixinFactory;
