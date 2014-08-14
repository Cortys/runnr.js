(function() {
	angular.module("themes")
		.directive("theme", theme);

	theme.$inject = ["$compile", "theme"];

	function theme($compile, theme) {
		return {
			restrict: "A",
			transclude: "element",
			link: function(scope, element, attrs) {
				if("theme" in attrs)
					theme.getTheme(function(theme) {
						var clone = angular.element(document.createElement("link")),
							i = 0;
						clone.attr("rel", "stylesheet");
						clone.attr("type", "text/css");
						theme.css.forEach(function(v, i) {
							console.log(arguments);
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
