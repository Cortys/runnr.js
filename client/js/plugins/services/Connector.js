(function() {
	angular.module("plugins")
		.factory("plugins.Connector", ConnectorFactory);

	ConnectorFactory.$inject = ["$q"];

	function ConnectorFactory($q) {
		// TODO: Implement application side of plugin / runner connector logic
		function Connector(plugin, eventTarget) {
			var t = this,
				r = t._receive.bind(t);

			t.plugin = plugin;
			t.eventTarget = eventTarget;

			window.addEventListener("message", t._listener = function(event) {
				if(t.eventTarget === event.source)
					protocol.receive(event, r);
			}, false);
		}

		Connector.prototype = {
			plugin: null,
			eventTarget: null,

			destroy: function() {
				window.removeEventListener("message", this._listener, false);
				this.plugin = this.eventTarget = null;
			},

			// handle high level connection stuff
			_receive: function(type, data, callback) {
				console.log(type, data);
			},

			send: function(message) {
				var t = this;
				return $q(function(resolve, reject) {
					if(t.eventTarget)
						protocol.send.message(t.eventTarget, message, function(data) {
							if(data !== undefined)
								resolve(data);
							else
								reject();
						});
				});
			}
		};

		var callbackStore = new Map(),
			storePos = 1,

		protocol = {

			send: {

				_getId: function() {
					return ((storePos = storePos+1)%Number.MAX_VALUE);
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
