function AbstractServer(router, provider, redirector) {
	if(typeof router != "function")
		router = this._null;
	if(typeof provider != "function")
		provider = this._null;
	if(typeof redirector != "function")
		redirector = this._null;

	this._router = router;
	this._provider = provider;
	this.exposed = redirector;
}

AbstractServer.prototype = {
	_null: function() {
		return null;
	},
	routes: function(object) {
		return typeof object == "object"?this._router.bind(object):this._router;
	},
	content: function(object) {
		return typeof object == "object"?this._provider.bind(object):this._provider;
	}
};

var B = require("bluebird"),
	path = require("path"),

	File = require("./File"),

	helper = require("./helper"),

	isPropertyPublic = function(object, name, fast) {
		if(!object)
			return false;
		return (fast || (""+name).charAt(0) != "_") && (object.propertyIsEnumerable(name) || isPropertyPublic(Object.getPrototypeOf(object), name, true));
	},

	objectServer = function(name, data) {
		if(typeof name != "string")
			throw new TypeError("'"+name+"' has to be of type string.");
		return B.resolve(this).then(function(object) {
			if(!isPropertyPublic(object, name) || typeof object[name] == "function")
				throw new Error("'"+name+"' could not be found.");
			if(data !== undefined)
				object[name] = data;
			return B.resolve(object[name]);
		});
	},

	redirector = function redirector(object) {

		if(!helper.isExposable(object))
			throw new TypeError("Only objects and functions can be exposed.");

		var t = this,
			o = Object.create(null),
			offer = t._parent._root.offer(o),
			promise = B.resolve(object);

		offer.provider(t.content(object)).router(function(route) {
			if(typeof route != "string")
				throw new TypeError("'"+route+"' has to be of type string.");
			return promise.then(function(object) {
				if(!isPropertyPublic(object, route) || typeof object[route] != "function")
					throw new Error("'"+route+"' could not be found.");
				var exposed = Object.create(null);
				t._parent._root.offer(exposed).provider(object[route].bind(object));
				return exposed;
			});
		});

		return o;
	},

	servers = {

		// STATIC OBJECT EXPOSAL: allows read-only access to object properties -> provider, router, redirector
		static: new AbstractServer(objectServer, function provider(content, data) {
			if(data !== undefined)
				throw new Error("'"+content+"' is read-only.");
			return objectServer.call(this, content);
		}, redirector),

		// DYNAMIC OBJECT EXPOSAL: allows writing access to object properties -> provider, router, redirector
		dynamic: new AbstractServer(objectServer, objectServer, redirector),

		// SERVE A DYNAMICALLY CREATED EXPOSED OBJECT: exposed at a given name -> router
		route: function route(name, baseContext, chained) {

			var f = function(route) {
					if(route == name)
						return o;
					throw new Error("'"+route+"' does not match this dynamic exposed route '"+name+"'.");
				}, convert = function(n, args) {
					if(baseContext)
						for(var i = 0, l = args.length, c; i < l; i++) {
							c = args[i];
							if(typeof c == "function")
								c = c.bind(baseContext);
							offer[n].call(offer, c);
						}
					else
						offer[n].apply(offer, args);
					return f;
				},
				o = Object.create(null),
				offer = this._root[chained?"chainedOffer":"offer"](o);

			f.provider = function() {
				return convert("provider", arguments);
			};
			f.router = function() {
				return convert("router", arguments);
			};
			f.redirector = function() {
				return convert("redirector", arguments);
			};
			return f;
		},

		api: function(exposed) {
			var api = new Api("", exposed);
			return api;
		},

		// FILTER REQUESTS: only propses cancellation of an unmatched request to following servers -> provider, router
		filtered: function filtered(filter) {
			return function(name) {
				// TODO
			};
		},

		// FILE SYSTEM EXPOSAL: read-only access -> provider
		fs: function fs(pathMap) {
			var map;
			if(typeof pathMap == "string")
				map = function(content) {
					return path.join(pathMap, content);
				};
			else if(typeof pathMap != "function")
				throw new Error("File system server map has to be of type string or function.");
			else
				map = pathMap;

			return function(content, data) {
				if(data !== undefined)
					throw new Error("File system server does not allow writing access.");
				return B.resolve(map.call(this, content)).then(function(result) {
					return new File(result);
				});
			};
		}
	};

module.exports = function init(apiRoot) {
	if(typeof apiRoot != "object")
		return servers;
	var o = Object.create(servers, { _root: { value: apiRoot } });
	o.static._parent = o.dynamic._parent = o;
	return o;
};
