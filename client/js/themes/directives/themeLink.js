(function() {
	angular.module("themes")
		.directive("themeLink", themeLink);

	themeLink.$inject = ["$compile", "$q", "themes.theme"];

	function themeLink($compile, $q, theme) {
		return {
			restrict: "A",
			transclude: "element",
			link: function(scope, element) {
				
				theme.getTheme().then(function(theme) {
					var clone = angular.element(document.createElement("link"));
					clone.attr("rel", "stylesheet");
					clone.attr("type", "text/css");
					theme.css.forEach(function(v) {
						clone.attr("href", "theme/"+v.file+".css");
						clone.attr("media", v.media || undefined);
						element.after(clone);
						clone = clone.clone();
					});
				});
			}
		};
	}

})();
