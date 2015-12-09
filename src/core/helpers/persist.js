"use strict";

// LokiJS.Collection#update will be called if a "persist" event is emitted.
// This mechanism is set up in the initializers of the loki store.
module.exports = function persist(object) {
	object.emit("persist");
};
