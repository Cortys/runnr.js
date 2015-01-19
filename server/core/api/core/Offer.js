var helper = require("./helper");

function Offer(object, baseApi, onlyInit) {
	if(!helper.isExposable(object) || object instanceof Offer)
		throw new TypeError("Only objects and functions can be exposed.");

	if(helper.isExposed(object))
		throw new TypeError("Objects may only be exposed once.");

	this._object = object;
	this._base = baseApi;

	if(onlyInit) return;

	var t = this,
		o = helper.exposer({
			router: { get: function() {
				return t._router;
			} },
			provider: { get: function() {
				return t._provider;
			} }
		});

	Object.defineProperty(object, "_exposed", { value: o });

}

Offer.prototype = {
	_object: null,
	_base: null,

	router: function(router) {
		if(typeof router == "function")
			this._router = router;
		return this;
	},

	provider: function(provider) {
		if(typeof provider == "function")
			this._provider = provider;

		return this;
	},

	redirector: function(exposed) {

		if(!helper.isExposed(exposed))
			throw new TypeError("Provided redirect target is not exposed.");
		this._router = exposed._exposed.router && exposed._exposed.router.bind(exposed);
		this._provider = exposed._exposed.provider && exposed._exposed.provider.bind(exposed);

		return this;
	},

	publish: function(name) {

		this._base.publish(name, this._object);

		return this;
	},

	unpublish: function() {

		this._base.unpublish(this._object);

		return this;
	}
};

module.exports = Offer;
