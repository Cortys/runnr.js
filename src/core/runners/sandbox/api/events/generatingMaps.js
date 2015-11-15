"use strict";

function generateMap(map) {
	return class extends map {
		constructor(generator) {
			super();

			this.generator = generator;
		}

		get(key) {
			let value = super.get(key);

			if(value === undefined) {
				value = this.generator(key);
				this.set(key, value);
			}

			return value;
		}

		lookup(key) {
			return super.get(key);
		}
	};
}

module.exports = {
	Map: generateMap(Map),
	WeakMap: generateMap(WeakMap)
};
