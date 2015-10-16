"use strict";

const owe = require("owe.js");

const update = Symbol("update");

class StoreItem extends require("events") {
	constructor(exposed, internalize, preset) {
		super();

		if(exposed)
			owe.expose.properties(this, exposed);

		if(internalize)
			for(const key of internalize) {

				if(this.hasOwnProperty(key))
					return;

				const desc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), key);

				if(desc) {
					desc.enumerable = true;
					Object.defineProperty(this, key, desc);
				}
			}

		if(preset && typeof preset === "object")
			Object.assign(this, preset);

		Object.defineProperty(this, "--update", {
			writable: true,
			value: false
		});
	}

	[update]() {
		this["--update"] = !this["--update"];
	}
}

StoreItem.update = update;

module.exports = StoreItem;
