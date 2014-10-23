var Q = require("q"),

	helper = { // these functions turn exposable objects into functions that map queries to the given objects
		cast: function(t, object, bind) {
			if(typeof object == "function") // if already a function
				return object;
			if(this.isExposed(object))
				return bind && object._exposed[t].bind(object) || object._exposed[t];
		},

		exposer: function(props) {
			var published;
			props.published = {
				get: function() {
					return published;
				},
				set: function(val) {
					published = val;
				}
			};
			var exposer = Object.create(Exposer.prototype, props);
			Object.freeze(exposer);
			return exposer;
		},

		isExposed: function(object) {
			return object && typeof object == "object" && "_exposed" in object && object._exposed instanceof Exposer;
		},

		EMPTY: new Error()
	};

helper.routerCast = helper.cast.bind(helper, "router");
helper.providerCast = helper.cast.bind(helper, "provider");

function Exposer() {}
Exposer.prototype = Object.create(null);

module.exports = helper;
