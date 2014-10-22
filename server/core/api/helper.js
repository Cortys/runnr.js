var Q = require("q"),

	helper = { // these functions turn exposable objects into functions that map queries to the given objects
		cast: function(t, object) {
			if(typeof object == "function") // if already a function
				return object;
			if(this.isExposed(object))
				return object._exposed[t];
		},

		exposer: function(props) {
			var exposer = Object.create(Exposer.prototype, props);
			Object.freeze(exposer);
			return exposer;
		},

		isExposed: function(object) {
			return object && typeof object == "object" && "_exposed" in object && object._exposed instanceof Exposer;
		},

		EMPTY: new Error()
	};

helper.routeCast = helper.cast.bind(helper, "router");
helper.contentCast = helper.cast.bind(helper, "provider");

function Exposer() {}
Exposer.prototype = Object.create(null);
Exposer.prototype.constructor = Exposer;

module.exports = helper;
