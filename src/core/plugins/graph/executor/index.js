"use strict";

const executors = {
	__proto__: null,

	"js": require("./js"),
	"graph": require("./graph")
};

module.exports = {
	execute(type, node) {
		if(!(type in executors))
			throw new Error(`Plugin type '${type}' is not executable.`);

		executors[type](node);
	}
};
