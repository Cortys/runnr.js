(function() {
	angular.module("themes")
		.directive("themeLink", themeLink);

	themeLink.$inject = ["$compile", "$q", "themes.api"];

	function themeLink($compile, $q, themesApi) {
		return {
			restrict: "A",
			transclude: "element",
			terminal: true,
			priority: 3001,
			link: function(scope, element) {

				themesApi.theme.then(function(theme) {
					var clone = angular.element(document.createElement("link"));
					clone.attr("rel", "stylesheet");
					clone.attr("type", "text/css");
					theme.css.main.forEach(function(v) {
						clone.attr("href", themesApi.raw(v.file));
						clone.attr("media", v.media || undefined);
						element.after(clone);
						clone = clone.clone();
					});
				});
			}
		};
	}

}());
