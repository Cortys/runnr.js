var connector = (function() {

	function init() {

		var connId = Math.random();

		window.addEventListener("message", function(event) {
			
		}, false);


		parent.postMessage({ type:"handshake", id:connId, application:"runnr" }, "*");
		parent.postMessage({ type:"test" }, "*");
	}

	init();

	return {
		// TODO: Implement plugin side of connector logic
	};
})();
