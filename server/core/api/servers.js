function AbstractServer(router, provider, thisBinding) {
	var m = false;
	if(typeof router != "function" && (m = true))
		this.router = this._null;
	if(typeof provider != "function" && (m = true))
		this.provider = this._null;
	if(m) return;

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
	fs = require("fs"),
	path = require("path"),

	helper = require("./helper"),

	isPropertyPublic = function(object, name) {
		return object.propertyIsEnumerable(name) && (""+name).charAt(0) != "_";
	},

	objectServer = function(name, data) {
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



		// FILTER REQUESTS: only propses cancellation of an unmatched request to following servers
		filtered: new AbstractServer(),

		// FILE SYSTEM EXPOSAL: read-only access, no routing
		fs: new AbstractServer(null, function provider(pathMap, options) {
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
				return fs.createReadStream(pathMap(content), options);
			};
		})
	};

module.exports = servers;
