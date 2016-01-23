"use strict";

const path = require("path");
const fs = require("fs-extra-promise");

function integrityCheck(plugin) {
	return path.isAbsolute(plugin.location)
		? Promise.resolve()
		: fs.statAsync(plugin.mainLocation).then(stat => {
			if(!stat.isFile())
				throw new Error("Main entry is no file.");
		});
}

module.exports = integrityCheck;
