var connector = (function() {

	function init() {

		var connId = Math.random();

		window.addEventListener("message", function(event) {
			console.log(event);
		}, false);

		parent.postMessage({ type:"handshake", id:connId, application:"runnr" }, "*");

	}

	init();

	return {
		// TODO: Implement plugin side of connector logic
	};
})();
