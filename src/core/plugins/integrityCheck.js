"use strict";

const path = require("path");
const fs = require("fs-extra-promise");

function integrityCheck(plugin) {
	if(typeof plugin.location !== "string")
		return Promise.reject(new Error("This plugin has no resource location."));

	return path.isAbsolute(plugin.location)
		? Promise.resolve()
		: plugin.mainLocation.then(mainLocation => fs.statAsync(mainLocation)).then(stat => {
			if(!stat.isFile())
				throw new Error("Main entry is no file.");
		});
}

module.exports = integrityCheck;
