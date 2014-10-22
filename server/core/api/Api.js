var Q = require("q"),

	helper = require("./helper");

function Api(name, basePromise) {
	this.name = name;
	this._basePromise = Q(basePromise).then(function(base) {
		if(!helper.isExposed(base))
			throw new TypeError("This route is not exposed.");
		return base;
	});
}

Api.prototype = {
	name: null,
	_basePromise: null,

	// API base methods:

	route: function(location) {
		var t = this;
		if(location == null || location === "")
			return t;
		return new Api(t.name+"/"+location, t._basePromise.then(function(base) {
			try {
				if(typeof base._exposed.router != "function")
					throw helper.EMPTY;
				return base._exposed.router.call(base, location);
			} catch(err) {
				if(err == helper.EMPTY)
					throw new Error("This route has no router.");
				throw err;
			}
		}).then(undefined, function(err) {
			if(typeof err == "object") {
				err.type = "route";
				err.location = t.name;
				err.route = location;
			}
			throw err;
		}));
	},

	get: function(content) {
		return this.send(content);
	},

	send: function(content, data) {
		var t = this;
		return t._basePromise.then(function(base) {
			try {
				if(typeof base._exposed.provider != "function")
					throw helper.EMPTY;
				return base._exposed.provider.call(base, content, data);
			} catch(err) {
				if(err == helper.EMPTY)
					throw new Error("This route has no content provider.");
				throw err;
			}
		}).then(undefined, function(err) {
			if(typeof err == "object" && !("location" in err)) {
				err.type = "content";
				err.location = t.name;
				err.content = content;
			}
			throw err;
		});
	}
};

module.exports = Api;
