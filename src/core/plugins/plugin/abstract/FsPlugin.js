"use strict";

const { mix, Mixin } = require("mixwith");

const config = require("../../../config");

const integrityCheck = require("../../integrityCheck");

const Plugin = require("./Plugin");

const FsPlugin = Mixin(superclass => class FsPlugin extends mix(superclass).with(Plugin) {
	constructor() {
		super(...arguments);

		this[Plugin.exposed].publicRoutes.add("ports");

		this[Plugin.exposed].privateRoutes.add("ports");
		this[Plugin.exposed].privateRoutes.add("location");
		this[Plugin.exposed].privateRoutes.add("mainLocation");
	}

	assign(preset, stages = {}) {
		const { validatePlugin = true } = stages;

		return super.assign(preset, Object.assign({}, stages, {
			setMetadata: () => {
				this.ports = preset.ports;
				this.location = preset.location;

				if(typeof stages.setMetadata === "function")
					return stages.setMetadata();
			},

			validatePlugin: validatePlugin && (() => {
				// Uninstall plugin if it was removed from fs, update otherwise:
				return integrityCheck(this).then(() => {
					if(this.source)
						return this.update();
				}, err => {
					console.error(`Plugin '${this.name}' is faulty and will be uninstalled.`, err);

					return this.uninstall();
				});
			})
		}));
	}

	get mainLocation() {
		return config.fromPlugins(this.location);
	}
});

module.exports = FsPlugin;
