"use strict";

const { mix, Mixin } = require("mixwith");

const integrityCheck = require("../integrityCheck");

const Plugin = require("./Plugin");

const FsPlugin = Mixin(superclass => class FsPlugin extends mix(superclass).with(Plugin) {
	assign(preset, checkForUpdates = true) {
		return super.assign(preset, {
			validatePlugin: checkForUpdates && (() => {
				// Uninstall plugin if it was removed from fs, update otherwise:
				return integrityCheck(this).then(() => {
					if(this.source)
						return this.update();
				}, err => {
					console.error(`Plugin '${this.name}' is faulty and will be uninstalled.`, err);

					return this.uninstall();
				});
			})
		});
	}
});

module.exports = FsPlugin;
