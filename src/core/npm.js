"use strict";

const childProcess = require("child_process");
const owe = require("owe.js");

const npmCli = require.resolve("npm/bin/npm-cli");

const config = require("./config");

function npm(...args) {
	return new Promise((resolve, reject) => {
		childProcess.fork(npmCli, args, {
			cwd: config.pluginData,
			silent: true,
			execArgv: []
		}).once("exit", code => (code ? reject : resolve)(code));
	});
}

module.exports = {
	install(plugin) {
		return npm("install", plugin, "--production", "--no-progress").catch(() => {
			throw new owe.exposed.Error("Plugin could not be installed.");
		});
	},

	uninstall(plugin) {
		return npm("uninstall", plugin).catch(() => {
			throw new owe.exposed.Error("Plugin could not be uninstalled.");
		});
	},

	dedupe() {
		return npm("dedupe").catch(() => {
			throw new owe.exposed.Error("Plugin dependencies could not be deduplicated.");
		});
	}
};
