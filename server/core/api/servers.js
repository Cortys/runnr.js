function AbstractServer(router, provider, thisBinding) {
	if(typeof router != "function")
		router = this._null;
	if(typeof provider != "function")
		provider = this._null;
	if(thisBinding) {
		this._router = router;
		this._provider = provider;
	}
	else {
		this.routes = router;
		this.content = provider;
	}
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

var Q = require("q"),
	path = require("path"),

	File = require("./File"),

	helper = require("./helper"),

	isPropertyPublic = function(object, name) {
		return object.propertyIsEnumerable(name) && (""+name).charAt(0) != "_";
	},

	objectServer = function(name, data) {
		if(typeof name != "string")
			throw new TypeError("'"+name+"' is not of type string.");
		return Q(this).then(function (object) {
			if(!isPropertyPublic(object, name))
				throw new Error("'"+name+"' could not be found.");
			if(data !== undefined)
				object[name] = data;
			return Q(object[name]);
		});
	},

	servers = {

		// STATIC OBJECT EXPOSAL: allows read-only access to object properties, static routing
		static: new AbstractServer(objectServer, function provider(content, data) {
			if(data !== undefined)
				throw new Error("'"+content+"' is read-only.");
			return objectServer.call(this, content);
		}, true),

		// DYNAMIC OBJECT EXPOSAL: allows writing access to object properties, static routing
		dynamic: new AbstractServer(objectServer, objectServer, true),

		// SERVE A DYNAMICALLY CREATED EXPOSED OBJECT: exposed at a given name
		exposed: function exposed(name, chained) {
			var f = function(route) {
				if(route == name)
					return f;
				throw new Error("'"+route+"' does not match this dynamic exposed route '"+name+"'.");
			}, offer = this._root[chained?"chainedOffer":"offer"](f);

			f.provider = function() {
				offer.provider.apply(offer, arguments);
				return f;
			};
			f.router = function() {
				offer.router.apply(offer, arguments);
				return f;
			};
			f.redirect = function() {
				offer.redirect.apply(offer, arguments);
				return f;
			};

			return f;
		},

		// FILTER REQUESTS: only propses cancellation of an unmatched request to following servers
		filtered: function filtered(filter) {
			return function(name) {

			};
		},

		// FILE SYSTEM EXPOSAL: read-only access, no routing
		fs: new AbstractServer(null, function provider(pathMap) {
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
				return new File(map.call(this, content));
			};
		})
	};

module.exports = function init(apiRoot) {
	if(typeof apiRoot != "object")
		return servers;
	return Object.create(servers, { _root: { value: apiRoot } });
};
