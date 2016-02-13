"use strict";

const path = require("path");
const resolve = require("resolve");

const home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
const userData = path.join(home, ".runnr");
const pluginData = path.join(userData, "plugins");

module.exports = {
	home,
	userData,
	pluginData,

	fromUserData() {
		return path.resolve(userData, ...arguments);
	},

	fromPlugins() {
		return new Promise((accept, reject) => resolve(path.resolve(...arguments), {
			basedir: pluginData
		}, (err, result) => {
			if(err)
				return reject(err);

			accept(result);
		}));
	}
};
