"use strict";

/**
 * An EventEmitter that does not enumerate its internal properties.
 * Needed to prevent LokiJS from storing EventEmitter state data.
 */
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
			_maxListeners: {
				writable: true,
				enumerable: false,
				configurable: false,
				value: this._maxListeners // eslint-disable-line no-underscore-dangle
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
