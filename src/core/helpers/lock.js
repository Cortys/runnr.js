"use strict";

module.exports = function generateLock(delayedUnlock) {
	let unlock;
	const lock = new Promise(resolve => unlock = resolve);

	lock.unlock = unlock;

	if(typeof delayedUnlock === "function")
		setImmediate(() => unlock(delayedUnlock()));

	return lock;
};
