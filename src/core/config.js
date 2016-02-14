"use strict";

const path = require("path");
const fs = require("fs-extra-promise");
const resolve = require("resolve");

const home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
const userData = path.join(home, ".runnr");
const pluginData = path.join(userData, "plugins");

// Synchronously ensure that  ~/.runnr/plugins/node_modules exist,
// since config is loaded during init this is acceptable:
fs.mkdirsSync(path.join(pluginData, "node_modules"));

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
