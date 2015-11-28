"use strict";

module.exports = function persist(object) {
	if(!("--update" in object))
		Object.defineProperty(object, "--update", {
			writable: true,
			value: false
		});

	object["--update"] = !object["--update"];
};
