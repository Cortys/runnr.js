var connector = (function() {

	var protocol = {

		connected: false,

		init: function() {

			var t = this;

			window.addEventListener("message", function(event) {
				t.receive(event);
			}, false);

			t.send.handshake();

		},

		send: {

			id: Math.random(),

			_do: function(message) {
				parent.postMessage(message, "*");
			},

			handshake: function() {
				this._do({ type:"handshake", id:this.id, application:"runnr" });
			},

			message: function(message) {
				this._do({ type:"message", message:message });
			}
		},

		receive: function(event) {
			var t = this,
				data = event.data,
				sender = event.source;
			if(!t.connected && data.type == "handshake" && data.application == "runnr") {
				t.connected = true;
				return;
			}
		}
	};

	protocol.init();

	return {
		// TODO: Implement plugin side of connector logic

	};
})();
