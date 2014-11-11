(function() {
	"use strict";

	var plugin = angular.module("plugin", ["core"]);

	plugin.directive("pluginList", pluginList);

	pluginList.$inject = [];

	function pluginList() {

		function Controller() {
			this._active = null;
		}

		Controller.prototype = {
			entries: [
				{
					name: "Hello World",
					instances: 5
				}, {
					name: "Foo Bar",
					instances: 3
				}, {
					name: "Baz Boo",
					instances: 1
				}
			],
			activate: function(plugin) {
				this._active = plugin;
			},
			isActive: function(plugin) {
				return plugin === this._active;
			}
		};

		return {
			restrict: "E",
			controller: Controller,
			controllerAs: "plugins",
			transclude: true,
			template: "<ng-transclude></ng-transclude>"
		};
	}
}());
