var querystring = require("querystring");

function UrlEncoder(route, done) {
	this._route = route;

	if(done)
		this.route = this.get = null;
}

UrlEncoder.prototype = {
	_route: null,

	route: function(route) {
		return new UrlEncoder(this._route+"/"+querystring.escape(route));
	},

	get: function(content) {
		return new UrlEncoder(this.route+"//"+querystring.escape(content), true);
	},

	get url() {
		return this._route;
	}
};

module.exports = new UrlEncoder("");
