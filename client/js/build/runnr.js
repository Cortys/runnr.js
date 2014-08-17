/* File: client/js/runnr.js */
angular.module("runnr.js", ["core", "top", "panes", "themes"]);

/* File: client/js/core/module.js */
angular.module("core", []);

/* File: client/js/panes/module.js */
angular.module("panes", ["core"]);

/* File: client/js/themes/module.js */
angular.module("themes", []);

/* File: client/js/top/module.js */
angular.module("top", ["core"]);

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

/* File: client/js/core/services/messageFactory.js */
(function() {
	angular.module("core")
		.factory("messageFactory", messageFactory);
	
	messageFactory.$inject = [];
	
	function messageFactory() {
		return {
			create: function(receiver, event, data) {
				return new Message(receiver, event, data);
			},
			check: function(message) {
				return message instanceof Message;
			}
		};
	}
	
	function Message(receiver, event, data) {
		this.receiver = receiver;
		this.event = event;
		this.data = data;
	}
})();
/* File: client/js/core/services/messages.js */
(function() {
	angular.module("core")
		.factory("messages", messages);
	
	messages.$inject = ["messageFactory"];
	
	function messages(messageFactory) {
		
		var receivers = {},
			noDelivery = {};
		
		function Deliverer(supply) {
			this.name = supply.toString();
		}
		
		Deliverer.prototype = {
			name: null,
			listeners: {},
			
			/* Send Message
			 * target: registered name of the receiver
			 * event: topic of the message
			 * data: appended data object
			 * minDelivery: required number of receivers. if not exceeded the message will be stored until new receivers appear. default = 1
			 */
			send: function(target, event, data, minDelivery) {
				var message = messageFactory.check(target) && target || messageFactory.create(target, event, data),
					receiverList = receivers[target] || [],
					noDeliveryTarget, noDeliveryEvents;
				
				minDelivery = (minDelivery === undefined?1:minDelivery) - receiverList.length;
				
				// deliver messages:
				receiverList.forEach(function(receiver) {
					receiver.receive(message);
				});
				
				// store message, if further deliveries are necessary
				if(minDelivery > 0) {
					if(!(noDeliveryTarget = noDelivery[target]))
						noDelivery[target] = noDeliveryTarget = {};
					if(!(noDeliveryEvents = noDeliveryTarget[event]))
						noDeliveryTarget[event] = noDeliveryEvents = [];
					
					noDeliveryEvents.push({
						message: message,
						deliveriesLeft: minDelivery
					});
				}
				
				return this;
			},
			on: function(event, listener) {
				
				var t = this,
					noDeliveryTarget, noDeliveryEvents, removedAll;
				
				if(typeof listener === "function") {
					t.listeners[event] = listener;
					
					if((noDeliveryTarget = noDelivery[this.name]) && (noDeliveryEvents = noDeliveryTarget[event])) {
						removedAll = true;
						noDeliveryEvents.forEach(function(e, i) {
							t.receive(e.message);
							if(--e.deliveriesLeft <= 0)
								delete noDeliveryEvents[i];
							else
								removedAll = false;
						});
						if(removedAll)
							delete noDeliveryTarget[event];
					}
				}
				
				return this;
			},
			receive: function(message) {
				var c;
				if(messageFactory.check(message) && message.receiver == this.name && typeof (c = this.listeners[message.event]) === "function")
					c(message.event, message.data);
			}
		};
		
		return {
			register: function(supply) {
				var deliverer = new Deliverer(supply),
					stored = receivers[deliverer.name];
				if(!stored)
					receivers[deliverer.name] = [deliverer];
				else
					stored.push(deliverer);
				return deliverer;
			}
		};
	}

})();

/* File: client/js/panes/controllers/Panes.js */
(function(){
	angular.module("panes")
		.controller("panes.PanesController", PanesController);
	
	PanesController.$inject = ["$scope", "messages"];
	
	function PanesController($scope, messages) {
		this.messageMan = messages.register("panes.PanesController").on("goto", function(event, page) {
			console.log(event, page);
		});
	}
	
	PanesController.prototype = {
		
	};
	
})();

/* File: client/js/themes/directives/preloadThemeLinkingDelay.js */
(function() {
	angular.module("themes")
		.directive("preloadThemeLinkingDelay", preloadLinkingDelay);

	preloadLinkingDelay.$inject = ["$q", "$timeout", "themes.theme"];

	function preloadLinkingDelay($q, $timeout, theme) {
		return {
			restrict: "A",
			scope: {
				preloadDelay: "@preloadThemeLinkingDelay"
			},
			compile: function() {
				var deferred = $q.defer(),
					delay = $q.defer();
				
				theme.addRenderingPromise($q.all([deferred.promise, delay.promise]));
				
				function link() {
					console.log(scope);
				}
				
				return {
					pre: function(scope) {
						$timeout(function() {
							delay.resolve();
						}, scope.preloadDelay*1);
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

	function MenuActionController() {

	}

	MenuActionController.prototype = {
		actions: [
			{
				name: "messages",
				clicked: function() {

				}
			}, {
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
	
	MenuController.$inject = ["messages"];
	
	function MenuController(messages) {
		this.messageMan = messages.register("top.MenuController");
		
		this.activateItem(this.items[1]);
	}

	MenuController.prototype = {
		items: [
			{
				name: "runners",
				text: "Runners"
			}, {
				name: "plugins",
				text: "Plugins"
			}
		],
		activeItem: null,
		activateItem: function(item) {
			this.activeItem = item;
			
			this.messageMan.send("panes.PanesController", "goto", item.name);
		}
	};

})();
