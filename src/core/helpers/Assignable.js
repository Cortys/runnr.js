"use strict";

const { Mixin } = require("mixwith");

const PromiseQueue = require("./PromiseQueue");
const generateLock = require("./generateLock");

const assigned = Symbol("assigned");
const assignLock = Symbol("assignLock");

const Assignable = Mixin(superclass => class Assignable extends superclass {
	constructor() {
		super(...arguments);

		const originalAssign = this.assign;

		if(typeof originalAssign !== "function")
			throw new Error("Assignables have to implement an assign method.");

		Object.defineProperty(this, "assign", {
			enumerable: false,
			value() {
				const promise = Promise.resolve(originalAssign.apply(this, arguments)).then(() => this);

				this[assigned].add(promise);
				promise.then(this[assignLock].unlock);

				return promise;
			}
		});

		this[assigned] = new PromiseQueue();
		this[assignLock] = generateLock();

		this[assigned].add(this[assignLock]);
	}

	get assigned() {
		return this[assigned].onEmpty;
	}

	get isAssigned() {
		return this[assigned].isEmpty;
	}
});

module.exports = Assignable;
