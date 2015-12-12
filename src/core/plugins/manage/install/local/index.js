"use strict";

const fs = require("fs");
const owe = require("owe.js");

const localFile = require("./file");
const localDirectory = require("./directory");

function local(plugin) {
	return new Promise((resolve, reject) => {
		fs.stat(plugin.path, (err, stat) => {
			if(err)
				return reject(new owe.exposed.Error("Invalid local installation path."));

			resolve(stat);
		});
	}).then(stat => (stat.isFile() ? localFile : localDirectory)(plugin));
}

module.exports = local;
