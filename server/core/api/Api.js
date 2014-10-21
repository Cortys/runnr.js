var Q = require("q"),

	helper = { // these functions turn exposable objects into functions that map queries to the given objects
		_err: function() {
			return Q.reject(new Error("No exposable source object found."));
		},
		_validate: function(object) {
			if(typeof object == "function") // if already a function
				return object;
			if(object == null || typeof object != "object") // if non null, not-object
				return this._err;
		},

		isExposed: function(object) {
			return object && typeof object == "object" && "_exposed" in object && object._exposed instanceof Exposer;
		},

		staticRoute: function(object, save) { // given key-value pair (or promise to one) is mapped to a route function
			var res;
			if(!save && (res = this._validate(object)) !== undefined)
				return res;
			object = Q(object);
			return function(route) {
				return object.then(function(object) {
					var res;
					if(route in object && typeof (res = object[route]) == "object" && (""+route).charAt(0) != "_")
						return res;
					else
						throw new Error("'"+route+"' not found.");
				});
			};
		},
		staticContent: function(object, save) { // given key-value pair (or promise to one) is mapped to a content function
			var res;
			if(!save && (res = this._validate(object)) !== undefined)
				return res;
			object = Q(object);
			return function(content, data) {
				if(data !== undefined)
					throw new Error("'"+content+"' is read-only.");
				return object.then(function (object) {
					if(!(content in object) || typeof object[content] == "function" || (""+content).charAt(0) == "_")
						throw new Error("'"+content+"' could not be found.");
					return Q(object[content]);
				});
			};
		},

		dynamicRouteCast: function(object) {
			var res;
			if((res = this._validate(object)) !== undefined)
				return res;
			if(this.isExposed(object))
				return object._exposed.router;
			return this.staticRoute(object, true);
		},

		dynamicContentCast: function(object) {
			var res;
			if((res = this._validate(object)) !== undefined)
				return res;
			if(this.isExposed(object))
				return object._exposed.content;
			return this.staticContent(object, true);
		}
	};

function Exposer() {}
Exposer.prototype = Object.create(null);

function Api(name, basePromise) {
	this.name = name;
	this._basePromise = Q(basePromise).then(function(base) {
		if(!helper.isExposed(base))
			throw new Error("This route is not exposed.");
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
			return base._exposed.router.call(base, location);
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
			return Q(base._exposed.content.call(base, content, data));
		}).then(undefined, function(err) {
			if(typeof err == "object" && !("location" in err)) {
				err.type = "content";
				err.location = t.name;
				err.content = content;
			}
			throw err;
		});
	},

	// make given object exposable by the API:

	expose: function(object, router, content) {
		if(object != null && typeof object == "object" || typeof object == "function") {
			if(helper.isExposed(object))
				throw new Error("Objects may only be exposed once.");
			var o;
			if(content === undefined && helper.isExposed(router))
				o = router._exposed;
			else {
				o = new Exposer();
				if(router === content && router === undefined)
					router = content = object;
				o.router = helper.dynamicRouteCast(router);
				o.content = helper.dynamicContentCast(content);
				Object.freeze(o);
			}
			Object.defineProperty(object, "_exposed", { value: o });
			return this;
		}
		throw new Error("Only objects can be exposed.");
	},

	// public static helpers:
	static: {
		content: function(object, contentFallback) {
			var f = helper.staticContent(object);
			if(typeof contentFallback != "function")
				contentFallback = null;
			return function(content, data) {
				var t = this,
					res = f.call(t, content, data);
				return contentFallback?res.then(undefined, function(err) {
					return contentFallback.call(t, content, data, err);
				}):res;
			};
		},
		route: function(object, routeFallback) {
			var f = helper.staticRoute(object);
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
