"use strict";

class PromiseQueue extends Set {
	add(promise) {
		promise = Promise.resolve(promise);

		const remove = () => {
			this.delete(promise);
		};

		promise.then(remove, remove);

		return super.add(promise);
	}
}

module.exports = PromiseQueue;
