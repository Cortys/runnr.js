var config = require("../../config"),
	path = require("path"),
	fs = require("fs"),
	Q = require("q"),
	themePath = config.root + "/themes";

function Theme(id) {
	this.id = id;
}

Theme.prototype = {
	id: null,

	get manifest() {
		var t = this;
		return Q.ninvoke(fs, "readFile", path.join(themePath, t.id, "manifest.json")).then(function(data) {
			var manifest = JSON.parse(data);
			Object.defineProperty(t, "manifest", {
				value: Q(manifest),
				writable: false,
				configurable: false
			});
			return manifest;
		});
	},

	raw: function(file) {
		return path.join(themePath, this.id, file);
	}
};

module.exports = Theme;
