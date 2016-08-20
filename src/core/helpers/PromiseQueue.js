"use strict";

const onEmpty = Symbol("onEmpty");

class PromiseQueue extends Set {
	constructor() {
		super();

		this[onEmpty] = {
			promise: Promise.resolve(true)
		};
	}

	add(promise) {
		const remove = () => this.delete(promise);

		promise.then(remove, remove);

		if(!this[onEmpty].resolve) {
			this[onEmpty].promise = new Promise(resolve => {
				this[onEmpty].resolve = () => {
					this[onEmpty].resolve = undefined;
					resolve(true);
				};
			});
		}

		return super.add(promise);
	}

	delete(promise) {
		const res = super.delete(promise);

		if(this.isEmpty && this[onEmpty].resolve)
			this[onEmpty].resolve();

		return res;
	}

	get isEmpty() {
		return this.size === 0;
	}

	get onEmpty() {
		return this[onEmpty].promise;
	}
}

module.exports = PromiseQueue;
