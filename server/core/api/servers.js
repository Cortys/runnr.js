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
		return Object.hasOwnProperty(object, name) && Object.getOwnPropertyDescriptor(object, name).enumerable && (""+name).charAt(0) != "_";
	},

	// STATIC OBJECT EXPOSAL: allows read-only access to object properties, static routing
	staticServer = new AbstractServer(function router(route) {
		return Q(this).then(function(object) {
			var res;
			if(isPropertyPublic(object, route) && typeof (res = object[route]) == "object")
				return res;
			else
				throw new Error("'"+route+"' could not found.");
		});
	}, function provider(content, data) {
		if(data !== undefined)
			throw new Error("'"+content+"' is read-only.");
		return dynamicServer._provider.call(this, content);
	}, true),

	// DYNAMIC OBJECT EXPOSAL: allows writing access to object properties, static routing
	dynamicServer = new AbstractServer(staticServer._router, function provider(content, data) {
		return Q(this).then(function (object) {
			if(!isPropertyPublic(object, content))
				throw new Error("'"+content+"' could not be found.");
			if(data !== undefined)
				object[content] = data;
			return Q(object[content]);
		});
	}, true),

servers = {
	static: staticServer,

	dynamic: dynamicServer,

	// EXPOSE FILE SYSTEM: read-only access, no routing
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
