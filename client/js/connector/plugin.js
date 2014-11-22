var connector = (function() {

	var protocol = {

		init: function() {

			window.addEventListener("message", function(event) {

			}, false);

			this.send.handshake();

		},

		send: {

			id: Math.random(),

			_do: function(message) {
				parent.postMessage(message, "*");
			},

			handshake: function() {
				this._do({ type:"handshake", id:this.id, application:"runnr" });
			}
		},

		receive: function() {

		}
	};

	protocol.init();

	return {
		// TODO: Implement plugin side of connector logic

	};
})();
