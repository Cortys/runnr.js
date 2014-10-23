var config = require("../../config"),
	path = require("path"),
	fs = require("fs"),
	Q = require("q"),

	api = require("../api"),

	themePath = config.root + "/themes";

function Theme(id) {
	this.id = id;

	this.manifest = this._manifest;

	var r = api.serve.exposed("raw").provider(this.raw.bind(this));

	console.log(r);

	api.offer(this).provider(
		api.serve.static.content()
	).router(
		r
	);
}

Theme.prototype = {
	id: null,

	get _manifest() {
		return Q.ninvoke(fs, "readFile", path.join(themePath, this.id, "manifest.json")).then(function(data) {
			return JSON.parse(data);
		});
	},

	raw: function(file) {
		var s = fs.createReadStream(path.join(themePath, this.id, file));
		s.on("error", function(err) {});
		return s;
	}
};

module.exports = Theme;
