"use strict";

const path = require("path");

const home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

module.exports = {
	home,
	userData: path.join(home, ".runnr.js"),

	fromUserData(dest) {
		return path.join(this.userData, dest);
	}
};
