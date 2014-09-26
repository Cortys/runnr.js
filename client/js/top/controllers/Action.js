(function() {
	angular.module("top")
		.controller("top.ActionController", TopActionController);

	TopActionController.$inject = [];

	function TopActionController() {

	}

	TopActionController.prototype = {
		actions: [
			/*{
				name: "messages",
				clicked: function() {

				}
			},*/ { // TODO: implement messaging API for plugins
				name: "settings",
				clicked: function() {

				}
			}/*, {
				name: "off",
				clicked: function() {

				}
			}*/ // TODO: implement password protected login and logout (later usecase for the off button)
		]
	};

})();
