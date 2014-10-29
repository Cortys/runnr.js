var config = require("../../config"),
	path = require("path"),
	fs = require("fs"),

	api = require("../api").api,

	themePath = config.root + "/themes";

function Theme(id) {
	this.id = id;

	this.manifest = this._manifest;

	api.offer(this).provider(
		api.serve.static.content()
	).router(
		api.serve.route("raw", this).provider(
			api.serve.fs(this.raw)
		)
	);
}

Theme.prototype = {
	id: null,

	get _manifest() {
		return fs.readFileAsync(path.join(themePath, this.id, "manifest.json")).then(function(data) {
			return JSON.parse(data);
		});
	},

	raw: function(file) {
		return path.join(themePath, this.id, file);
	}
};

module.exports = Theme;
