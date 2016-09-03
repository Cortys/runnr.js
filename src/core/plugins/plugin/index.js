"use strict";

module.exports = {
	Plugin: require("./Plugin"),
	PluginNode: require("./PluginNode"),

	install(plugin) {
		return manage.install(plugin);
	}
};

const manage = require("./manage");
