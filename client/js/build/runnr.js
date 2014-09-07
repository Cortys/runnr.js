'use strict';

angular.module("runnr.js", ["core", "top", "panes", "themes", "ngAnimate"]);

angular.module("core", []);

angular.module("panes", ["core", "plugins"]);

angular.module("plugins", []);

angular.module("themes", []);

angular.module("top", ["panes", "core"]);

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

(function() {
	angular.module("core")
		.factory("core.History", HistoryFactory);

	HistoryFactory.$inject = ["core.State"];

	function HistoryFactory(State) {
		
		function History() {
			this.states = [];
		}
		
		History.prototype = {
			states: null,
			lastMove: 0,
			
			validateState: function(state, noId) {
				return State.isAppendable()?state:new State(state, noId?undefined:this.states.length);
			},
			
			pushState: function(state) {
				this.states.push(this.validateState(state));
				this.lastMove = 1;
			},
			replaceState: function(state) {
				this.states = [];
				this.pushState(state);
				this.lastMove = 0;
			},
			
			backBy: function(by) {
				if(by === undefined)
					by = 1;
				if(isNaN(by))
					return;
				this.states = this.states.slice(0, Math.max(this.states.length - by, 0));
				this.lastMove = -by;
			},
			
			backTo: function(to) {
				if(isNaN(to))
					return;
				to = Math.min(to, this.states.length-1);
				this.lastMove = to - this.states.length
				this.states = this.states.slice(0, to+1);
			},
			
			getState: function(back) {
				if(back === undefined)
					back = 0;
				if(isNaN(back))
					return;
				return this.states[this.states.length-1-back];
			},
			
			getStates: function(back) {
				if(isNaN(back))
					return;
				return this.states.slice(-back);
			}
		};
		
		return History;
	}
})();

(function() {
	angular.module("core")
		.factory("core.State", StateFactory);

	StateFactory.$inject = [];

	function StateFactory() {

		function State(data, id) {
			this.data = State.isState(data)?state.data:data;
			
			Object.defineProperty(this, "id", {
				get: function() {
					return id;
				},
				set: function(val) {
					if(id == undefined)
						id = val;
				}
			});
		}
		
		State.prototype = {
			isIdentified: function() {
				return this.id !== null;
			}
		};
		
		State.isState = function(state) {
			return state instanceof State;
		};
		State.isAppendable = function(state) {
			return State.isState(state) && state.isIdentified();
		};

		return State;
	}
})();

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

(function() {
	angular.module("plugins")
		.directive("plugin", plugin);

	plugin.$inject = [];

	function plugin() {
		
		PluginCtrl.$inject = ["$scope"];
		
		function PluginCtrl($scope) {
			console.log($scope.id());
		}
		
		return {
			restrict: "E",
			scope: {
				id: "&name"
			},
			controller: PluginCtrl
		};
	}

})();

(function() {
	angular.module("panes")
		.factory("panes.history", historyFactory);
		
	historyFactory.$inject = ["core.History"];
	
	function historyFactory(History) {
		
		var history = new History();
		
		history.validateState = function(state) {
			state = History.prototype.validateState(state, true);
			state.id = this.states.length + state.data.text;
			return state;
		};
			
		return history;
	}
})();

(function() {
	angular.module("plugins")
		.factory("plugins.Plugin", PluginFactory);

	PluginFactory.$inject = ["$http"];

	function PluginFactory($http) {

		function Plugin(id) {
			this.id = id;
			console.log(id);
		}

		Plugin.prototype = {
			name: null,
			id: null,
			
			onInitialized: null
		};
		
		Plugin.isPlugin = function(plugin) {
			return plugin instanceof Plugin;
		};
		
		return Plugin;
	}
})();

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

(function() {
	angular.module("themes")
		.directive("themeInclude", themeInclude);

	themeInclude.$inject = ["$compile", "$q", "themes.theme"];

	function themeInclude($compile, $q, theme) {
		return {
			restrict: "E",
			scope: {},
			priority: 3000,
			link: function(scope, element, attrs) {
				if(!attrs.ngInclude) {
					
					var deferred = $q.defer();
					theme.addRenderingPromise(deferred.promise);
					
					theme.getTheme().then(function(theme) {
						element.attr("ng-include", "'api/theme/" + (scope.$eval(attrs.src) || theme.html) +"'");
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

(function() {
	angular.module("themes")
		.directive("themeLink", themeLink);

	themeLink.$inject = ["$compile", "$q", "themes.theme"];

	function themeLink($compile, $q, theme) {
		return {
			restrict: "A",
			transclude: "element",
			terminal: true,
			priority: 3001,
			link: function(scope, element) {
				
				theme.getTheme().then(function(theme) {
					var clone = angular.element(document.createElement("link"));
					clone.attr("rel", "stylesheet");
					clone.attr("type", "text/css");
					theme.css.forEach(function(v) {
						clone.attr("href", "api/theme/"+v.file);
						clone.attr("media", v.media || undefined);
						element.after(clone);
						clone = clone.clone();
					});
				});
			}
		};
	}

})();

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
		
		themePromise = $http.get("/api/theme/manifest", { responseType:"json" }).then(function(result) {
			return result.data;
		}),
		renderDeferred = $q.defer(),
		renderPromises = 0;
		
		o.addRenderingPromise(themePromise);
		
		return o;
	}
	
})();

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

//# sourceMappingURL=runnr.js.map