var connector = (function() {

	var protocol = {

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
		}
	};

	protocol.init();

	return {
		// TODO: Implement plugin side of connector logic

	};
})();
