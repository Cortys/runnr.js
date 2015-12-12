"use strict";

const owe = require("owe.js");

function localDirectory() {
	throw new owe.exposed.Error("Currently only files can be installed.");
}

module.exports = localDirectory;
