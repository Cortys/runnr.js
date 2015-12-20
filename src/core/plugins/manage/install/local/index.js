"use strict";

const fs = require("fs-extra-promise");
const owe = require("owe.js");

const localFile = require("./file");
const localDirectory = require("./directory");

function local(plugin, delayer) {
	return fs.isDirectoryAsync(plugin.path).then(dir => {
		return (dir ? localDirectory : localFile)(plugin, delayer);
	}, () => new owe.exposed.Error("Invalid local installation path."));
}

module.exports = local;
