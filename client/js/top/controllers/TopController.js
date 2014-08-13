(function() {
	angular.module("top")
		.controller("TopController", TopController);

	function TopController() {

	}

	TopController.prototype = {
		actions: [
			{
				name: "messages",
				clicked: function() {

				}
			}, {
				name: "settings",
				clicked: function() {

				}
			}, {
				name: "off",
				clicked: function() {

				}
			}
		]
	};

})();
