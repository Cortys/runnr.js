"use strict";

const path = require("path");

const home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

module.exports = {
	home,
	userData: path.join(home, ".runnr.js"),

	fromUserData() {
		return path.resolve(this.userData, ...arguments);
	},

	fromPlugins() {
		return this.fromUserData("plugins", ...arguments);
	}
};
