"use strict";

function* counterGenerator() {
	let position = 0;

	while(true) {
		if(!Number.isSafeInteger(position) || position === -1)
			position = Number.MIN_SAFE_INTEGER;

		yield position++;
	}
}

module.exports = function generateCounter() {
	const counter = counterGenerator();

	return {
		count: () => counter.next().value
	};
};
