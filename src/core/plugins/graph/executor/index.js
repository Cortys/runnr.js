"use strict";

const executors = {
	__proto__: null,

	"js": require("./js"),
	"graph": require("./graph"),
	"customGraph": require("./graph")
};

module.exports = {
	execute(node) {
		return node.plugin.type.then(type => {
			if(!(type in executors))
				throw new Error(`Plugin type '${type}' is not executable.`);

			return executors[type](node);
		});
	}
};
