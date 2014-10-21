var config = require("../../config"),
	path = require("path"),
	fs = require("fs"),
	Q = require("q"),

	api = require("../api/tools"),

	themePath = config.root + "/themes";

function Theme(id) {
	this.id = id;

	this.manifest = this._manifest;

	api.expose(this);
}

Theme.prototype = {
	id: null,

	get _manifest() {
		return Q.ninvoke(fs, "readFile", path.join(themePath, this.id, "manifest.json")).then(function(data) {
			return JSON.parse(data);
		});
	},

	raw: function(file) {
		return fs.createReadStream(path.join(themePath, this.id, file));
	}
};

module.exports = Theme;
