"use strict";

module.exports = function generateLock() {
	let unlock;
	const lock = new Promise(resolve => unlock = resolve);

	lock.unlock = data => {
		unlock(data);

		return data;
	};

	return lock;
};
