(function() {
	angular.module("plugins")
		.factory("plugins.Connector", ConnectorFactory);

	ConnectorFactory.$inject = [];

	function ConnectorFactory() {
		// TODO: Implement application side of plugin / runner connector logic
		function Connector(plugin) {

			var t = this,
				r = t._receive.bind(t);

			t.plugin = plugin;
			t._eventTargets = new Set();

			window.addEventListener("message", function(event) {
				if(t._eventTargets.has(event.source))
					protocol.receive(event, r);
			}, false);
		}

		Connector.prototype = {
			plugin: null,

			_eventTargets: null,

			addEventTarget: function(target) {
				if(typeof target != "object" || typeof target.postMessage != "function")
					throw new TypeError("Only objects with an implemented postMessage API can be a plugin event target.");
				this._eventTargets.add(target);
			},

			removeEventTarget: function(target) {
				return this._eventTargets.delete(target);
			},

			// handle high level connection stuff
			_receive: function(type, data, callback) {
				console.log(type, data);
			}
		};

		var callbackStore = new Map(),
			storePos = 1,

		protocol = {

			send: {

				_getId: function() {
					return (storePos = storePos+1%Number.MAX_VALUE);
				},

				_do: function(target, message) {
					target.postMessage(message, "*");
				},

				handshake: function(target, id) {
					this._do(target, { type:"handshake", id:id, application:"runnr" });
				},

				message: function(target, message, callback, responseTo) {

					var id = this._getId();

					this._do(target, { type:"message", id:id, message:message, responseTo:responseTo });
					if(typeof callback == "function")
						callbackStore.set(id, callback);
				}
			},
			// handle low level connection stuff
			receive: function(event, callback) {
				var t = this,
					data = event.data,
					sender = event.source;
				if(data.type == "handshake" && data.application == "runnr") {
					t.send.handshake(sender, data.id);
					callback("handshake");
					return;
				}
				if(data.type == "message")
					if(!data.responseTo)
						callback("message", data.message, function(response) {
							t.send.message(sender, response, null, data.id);
						});
					else if(callbackStore.has(data.responseTo))
						callbackStore.get(data.responseTo)();
			}
		};

		return Connector;
	}
}());
