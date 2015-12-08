"use strict";

class EventEmitter extends require("events") {
	constructor() {
		super();
		Object.defineProperties(this, {
			_events: {
				writable: true,
				enumerable: false,
				configurable: false,
				value: this._events // eslint-disable-line no-underscore-dangle
			},
			_eventsCount: {
				writable: true,
				enumerable: false,
				configurable: false,
				value: this._eventsCount // eslint-disable-line no-underscore-dangle
			},
			domain: {
				writable: true,
				enumerable: false,
				configurable: false,
				value: this.domain
			}
		});
	}
}

module.exports = EventEmitter;
