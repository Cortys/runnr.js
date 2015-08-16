"use strict";

const path = require("path");

module.exports = {
	userData: path.join(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE, ".runnr.js"),

	fromUserData(dest) {
		return path.join(this.userData, dest);
	}
};
