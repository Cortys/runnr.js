(function() {
	angular.module("plugins")
		.factory("plugins.Connector", ConnectorFactory);

	ConnectorFactory.$inject = [];

	function ConnectorFactory() {
		// TODO: Implement application side of plugin / runner connector logic
		function Connector(plugin) {

			var t = this,
				r = t.receive.bind(t);

			t.plugin = plugin;
			t._eventTargets = new Set();

			window.addEventListener("message", function(event) {
				
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
			receive: function(type, data) {

			}
		};

		var protocol = {
			send: {
				_do: function(target, message) {

					target.postMessage(message, "*");
				},

				handshake: function(target, id) {
					this._do(target, { type:"handshake", id:id, application:"runnr" });
				}
			},
			// handle low level connection stuff
			receive: function(event, callback) {
				var data = event.data,
					sender = event.source;
				if(data.type == "handshake" && data.application == "runnr")
					return this.send.handshake(sender, data.id);
				callback(data.type, data.message);
			}
		};

		return Connector;
	}
}());
