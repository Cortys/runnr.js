"use strict";

const { Mixin } = require("mixwith");

const PromiseQueue = require("./PromiseQueue");
const generateLock = require("./generateLock");

const loaded = Symbol("loaded");
const assignLock = Symbol("assignLock");

const Assignable = Mixin(superclass => class Assignable extends superclass {
	constructor() {
		super(...arguments);

		this[loaded] = new PromiseQueue();
		this[assignLock] = generateLock();

		this[loaded].add(this[assignLock]);
	}

	assign(promise) {
		this[loaded].add(promise);
		promise.then(this[assignLock].unlock);

		return promise.then(() => this);
	}

	get loaded() {
		return this[loaded].onEmpty;
	}
});

module.exports = Assignable;
