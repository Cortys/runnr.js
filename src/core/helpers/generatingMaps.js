"use strict";

const maybeMap = {
	get() {
		return undefined;
	},

	forceGet() {
		return undefined;
	},

	maybeGet() {
		return this;
	}
};

function generateMap(map) {
	return class extends map {
		constructor(generator) {
			super();

			this.generator = generator;
		}

		forceGet(key) {
			let value = this.get(key);

			if(value === undefined) {
				value = this.generator(key);
				this.set(key, value);
			}

			return value;
		}

		maybeGet(key) {
			const value = this.get(key);

			return value === undefined ? maybeMap : value;
		}
	};
}

module.exports = {
	Map: generateMap(Map),
	WeakMap: generateMap(WeakMap)
};
