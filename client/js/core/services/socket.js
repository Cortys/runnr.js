(function() {
	angular.module("core")
		.factory("core.socket", socket);

	socket.$inject = ["$location"];

	function socket($location) {
		var connection = io($location.protocol()+"://"+$location.host()+":"+location.port);
		console.log(connection);
		return null;
	}
}());
