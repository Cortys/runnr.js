"use strict";

const sandboxedModule = require("sandboxed-module");

const SandboxHandle = require("./SandboxHandle");

function execute(node) {
	return node.plugin.mainLocation.then(mainLocation => {
		return sandboxedModule.load(mainLocation, {
			globals: {
				runnr: new SandboxHandle(node)
			}
		});
	});
}

module.exports = execute;
