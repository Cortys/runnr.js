/* File: client/js/runnr.js */
angular.module("runnr.js", ["core", "top", "panes", "themes", "ngAnimate"]);

/* File: client/js/core/module.js */
angular.module("core", []);

/* File: client/js/panes/module.js */
angular.module("panes", ["core"]);

/* File: client/js/themes/module.js */
angular.module("themes", []);

/* File: client/js/top/module.js */
angular.module("top", ["panes"]);

/* File: client/js/core/controllers/Meta.js */
(function() {
	angular.module("core")
		.controller("MetaController", MetaController);

	MetaController.$inject = ["themes.theme"];

	function MetaController(theme) {
		var t = this;

		t.title = "";

		theme.getTheme().then(function(theme) {
			t.theme = theme;
		});
	}

})();

/* File: client/js/core/services/History.js */
(function() {
	angular.module("core")
		.factory("core.History", HistoryFactory);

	HistoryFactory.$inject = [];

	function HistoryFactory() {
		
		function History() {
			this.states = [];
		}
		
		History.prototype = {
			states: null,
			
			pushState: function(state) {
				this.states.push(state);
			},
			replaceState: function(state) {
				this.states = [state];
			},
			
			back: function(by) {
				if(by === undefined)
					by = 1;
				if(isNaN(by))
					return;
				this.states = this.states.slice(0, Math.max(this.states.length - by, 0));
			},
			
			getState: function(back) {
				if(back === undefined)
					back = 0;
				if(isNaN(back))
					return;
				return this.states[this.states.length-1-back];
			}
		};
		
		return History;
	}
})();
/* File: client/js/panes/controllers/Panes.js */
(function(){
	angular.module("panes")
		.controller("panes.PanesController", PanesController);
	
	PanesController.$inject = ["$scope", "panes.history"];
	
	function PanesController($scope, history) {
		this.history = history;
	}
	
	PanesController.prototype = {
		history: null
	};
	
})();

/* File: client/js/panes/services/history.js */
(function() {
	angular.module("panes")
		.factory("panes.history", history);
		
	history.$inject = ["core.History"];
	
	function history(History) {
		
		var history = new History();
		
		return history;
	}
})();
/* File: client/js/themes/directives/preloadThemeLinkingDelay.js */
(function() {
	angular.module("themes")
		.directive("preloadThemeLinkingDelay", preloadLinkingDelay);

	preloadLinkingDelay.$inject = ["$q", "$timeout", "themes.theme"];

	function preloadLinkingDelay($q, $timeout, theme) {
		return {
			restrict: "A",
			compile: function() {
				var deferred = $q.defer(),
					delay = $q.defer();
				
				theme.addRenderingPromise($q.all([deferred.promise, delay.promise]));
				
				function link() {
					console.log(scope);
				}
				
				return {
					pre: function(scope, element, attr) {
						$timeout(function() {
							delay.resolve();
						}, attr.preloadThemeLinkingDelay*1);
					},
					post: function() {
						deferred.resolve();
					}
				};
			}
		};
	}

})();

/* File: client/js/themes/directives/showOnThemePreload.js */
(function() {
	angular.module("themes")
		.directive("showOnThemePreload", showOnThemePreload);

	showOnThemePreload.$inject = ["themes.theme"];

	function showOnThemePreload(theme) {
		return {
			restrict: "A",
			scope: {},
			link: function(scope, element) {
				theme.rendered().then(function() {
					scope.$destroy();
				});
				
				scope.$on("$destroy", function(event) {
					element.remove();
				});
			}
		};
	}

})();

/* File: client/js/themes/directives/themeInclude.js */
(function() {
	angular.module("themes")
		.directive("themeInclude", themeInclude);

	themeInclude.$inject = ["$compile", "$q", "themes.theme"];

	function themeInclude($compile, $q, theme) {
		return {
			restrict: "E",
			scope: {},
			link: function(scope, element, attrs) {
				if(!attrs.ngInclude) {
					
					var deferred = $q.defer();
					theme.addRenderingPromise(deferred.promise);
					
					theme.getTheme().then(function(theme) {
						element.attr("ng-include", "'theme/" + (scope.$eval(attrs.src) || theme.html+".html") +"'");
						element.removeAttr("src");
						$compile(element)(scope);
					});
					
					scope.$on("$includeContentLoaded", deferred.resolve);
					scope.$on("$includeContentError", deferred.reject);
				}
			}
		};
	}
	
})();

/* File: client/js/themes/directives/themeLink.js */
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

/* File: client/js/themes/services/theme.js */
(function() {
	angular.module("themes")
		.factory("themes.theme", theme);

	theme.$inject = ["$http", "$q"];

	function theme($http, $q) {
		var o = {
			getTheme: function () {
				return themePromise;
			},
			rendered: function() {
				return renderDeferred.promise;
			},
			addRenderingPromise: function(promise) {
				renderPromises++;
				promise.then(function() {
					if(--renderPromises <= 0)
						renderDeferred.resolve();
				}, function() {
					renderDeferred.reject();
				});
			}
		},
		
		themePromise = $http.get("/theme/manifest", { responseType:"json" }).then(function(result) {
			return result.data;
		}),
		renderDeferred = $q.defer(),
		renderPromises = 0;
		
		o.addRenderingPromise(themePromise);
		
		return o;
	}
	
})();

/* File: client/js/top/controllers/Action.js */
(function() {
	angular.module("top")
		.controller("top.ActionController", MenuActionController);
	
	MenuActionController.$inject = [];
	
	function MenuActionController() {

	}

	MenuActionController.prototype = {
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

/* File: client/js/top/controllers/Menu.js */
(function() {
	angular.module("top")
		.controller("top.MenuController", MenuController);
	
	MenuController.$inject = ["panes.history"];
	
	function MenuController(panesHistory) {
		this.panesHistory = panesHistory;
		this.activateItem(this.items[0]);
	}

	MenuController.prototype = {
		activeItem: null,
		panesHistory: null,
		
		items: [
			{
				name: "runners",
				text: "Runners"
			}, {
				name: "plugins",
				text: "Plugins"
			}
		],
		
		activateItem: function(item) {
			this.activeItem = item;
			this.panesHistory.replaceState(item);
		}
	};

})();
