"use strict";

const { wrap } = require("mixwith");

function Dedupe(mixin) {
	const mixinApplied = Symbol("mixinApplied");

	return wrap(mixin, superclass => {
		if(superclass[mixinApplied])
			return superclass;

		const applied = mixin(superclass);

		applied[mixinApplied] = true;

		return applied;
	});
}

module.exports = Dedupe;
