"use strict";

module.exports = new class extends WeakMap {
	delete(api) {
		const meta = this.get(api);

		if(!meta)
			return false;

		meta.listeners.forEach(listener => setImmediate(() => listener.removeAllFromApi(api)));
		api.unobserveProtocol(meta.observer);
		super.delete(api);

		return true;
	}

	addListener(api, listener) {
		let meta = this.get(api);

		if(!meta) {
			const observer = connected => {
				if(!connected)
					this.delete(api);
			};

			meta = {
				listeners: new Set(),
				observer
			};
			api.observeProtocol(observer);
			this.set(api, meta);
		}

		meta.listeners.add(listener);

		if(!api.connected)
			this.delete(api);
	}

	removeListener(api, listener) {
		const meta = this.get(api);

		if(!meta)
			return false;

		const res = meta.listeners.delete(listener);

		if(meta.listeners.size === 0)
			this.delete(api);

		return res;
	}
};
