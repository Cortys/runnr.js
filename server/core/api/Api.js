var Q = require("q"),

	helper = { // these functions turn exposable objects into functions that map queries to the given objects
		_validate: function(object) {
			if(typeof object == "function") // if already a function
				return object;
			if(object && typeof object != "object") // if non null object
				return null;
		},
		staticRoute: function(object) { // given key-value pair (or promise to one) is mapped to a route function
			var res;
			if((res = this._validate(object)) !== undefined)
				return res;
			object = Q(object);
			return function(route) {
				return object.then(function(object) {
					var res;
					if(typeof (res = object[route]) == "object")
						return res;
					else
						throw new Error("'"+route+"' not found.");
				});
			};
		},
		staticContent: function(object) { // given key-value pair (or promise to one) is mapped to a content function
			var res;
			if((res = this._validate(object)) !== undefined)
				return res;
			object = Q(object);
			return function(content, data) {
				if(data !== undefined)
					return Q.reject(new Error("'"+content+"' is read-only."));
				return object.then(function (object) {
					return Q(object[content]);
				});
			};
		}
	};

function Api(name, basePromise) {
	this.name = name;
	this._basePromise = Q(basePromise).then(function(base) {
		if(typeof base._exposed != "object")
			throw new Error("This route is not exposed.");
	}).then(undefined, function(err) {
		err.location = name;
		throw err;
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
			if(typeof base._exposed.router != "function")
				throw new Error("This route cannot be routed.");
			return base._exposed.router.call(base, location);
		}));
	},

	get: function(content) {
		return this.send(content);
	},

	send: function(content, data) {
		return this._basePromise.then(function(base) {
			if(typeof base._exposed.content != "function")
				throw new Error("This route has no content.");
			return Q(base._exposed.content.call(base, content, data));
		});
	},

	// make given object exposable by the API:

	expose: function(object, content, router) {
		object._exposed = {
			content: helper.staticContent(content),
			router: helper.staticRoute(router)
		};
		return this;
	},

	// public static helpers:
	static: {
		content: function(object, contentFallback) {
			var f = helpers.staticContent(object);
			if(typeof contentFallback != "function")
				contentFallback = null;
			return function(content, data) {
				var t = this,
					res = f.call(t, content, data).then(function(content) {
						if(content === undefined)
							throw 0;
					});
				return contentFallback?res.then(undefined, function(err) {
					return contentFallback.call(t, content, data, err);
				}):res;
			};
		},
		route: function(object, routeFallback) {
			var f = helpers.staticRoute(object);
			if(typeof routeFallback != "function")
				routeFallback = null;
			return function(route) {
				var t = this,
					res = f.call(t, route);
				return routeFallback?res.then(undefined, function(err) {
					return routeFallback.call(t, route, err);
				}):res;
			};
		}
	}
};

module.exports = Api;
