(function() {
	"use strict";

	var plugin = angular.module("plugin", ["core"]);

	plugin.directive("pluginList", pluginList);

	pluginList.$inject = [];

	function pluginList() {
		// TODO: Implement data layer for plugin list
		function Controller() {
			this._active = null;
			this.entries = [];
		}

		Controller.prototype = {
			entries: null,
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
