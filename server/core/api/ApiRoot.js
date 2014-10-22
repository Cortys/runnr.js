var Q = require("q"),
	Api = require("./Api"),
	helper = require("./helper"),
	serve = require("./servers");

function ApiRoot(name) {

	this._routes = {};

	this.offer(this._routes).router(serve.static.routes());

	Api.call(this, name, this._routes);
}

ApiRoot.prototype = Object.create(Api.prototype);
ApiRoot.prototype.constructor = ApiRoot;

ApiRoot.prototype.publish = function(name, exposed) {

	if(typeof name != "string")
		throw new TypeError("Only string names can be used for publishing.");

	if(!helper.isExposed(exposed))
		throw new TypeError("Only exposed objects can be published.");

	if(name in this._routes)
		throw new Error("The route '"+name+"' is already used.");

	this._routes[name] = exposed;

	return this;
};

ApiRoot.prototype.offer = function(object) {
	return new Offer(object, this);
};

function Offer(object, baseApi) {
	if(object == null || typeof object != "object" && typeof object != "function" || object instanceof Offer)
		throw new TypeError("Only objects and functions can be exposed.");

	if(helper.isExposed(object))
		throw new TypeError("Objects may only be exposed once.");

	this._object = object;
	this._base = baseApi;

	var routers = this._routers = [],
		providers = this._providers = [],
		server = Offer.server,
		router = server.bind(undefined, routers),
		provider = server.bind(undefined, providers),

		o = helper.exposer({
			router: { value: router },
			provider: { value: provider }
		});

	Object.defineProperty(object, "_exposed", { value: o });

}

Offer.server = function(arr) {

	if(arr.length === 0)
		throw helper.EMPTY;

	var t = this,
		curr;
	arr.forEach(function(s) {
		if(!curr)
			try {
				curr = s.apply(t, Array.prototype.slice.call(arguments, 1));
				if(!Q.isPromiseAlike(curr))
					return false;
			} catch(err) {
				curr = Q.reject(err);
			}
		else
			curr.then(undefined, function(err) {
				return s.apply(t, Array.prototype.slice.call(arguments, 1).concat([err]));
			});
	});
	return curr;
};

Offer.prototype = {
	_object: null,
	_base: null,
	_routers: null,
	_providers: null,

	_pushRouter: function(router) {
		if(typeof router == "function")
			this._routers.push(router);
	},

	_pushProvider: function(provider) {
		if(typeof provider == "function")
			this._providers.push(provider);
	},

	router: function(router) {
		var a = arguments.length;
		for(var i = 0; i < a; i++)
			this._pushRouter(helper.routeCast(arguments[i]));

		return this;
	},

	provider: function(provider) {
		var a = arguments.length;
		for(var i = 0; i < a; i++)
			this._pushProvider(helper.providerCast(arguments[i]));

		return this;
	},

	redirect: function(exposed) {
		var a = arguments.length;
		for(var i = 0; i < a; i++) {
			var v = arguments[i];
			if(!helper.isExposed(v))
				throw new TypeError("Provided redirect target [index = "+i+"] is not exposed.");
			this._pushRouter(v._exposed.router);
			this._pushProvider(v._exposed.provider);
		}

		return this;
	},

	publish: function(name) {

		this._base.publish(name, this._object);

		return this;
	}
};

module.exports = ApiRoot;
