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
		
		var receivers = {};
		
		return {
			register: function(supply) {
				var man = new MessageMan(supply),
					stored = receivers[man.name];
				if(!stored)
					receivers[man.name] = [man];
				else
					stored.push(man);
				return man;
			}
		};
		
		function MessageMan(supply) {
			try {
				this.name = supply.$get.name;
			} catch (e) {
				throw "Invalid message supplier.";
			}
		}
		
		MessageMan.prototype = {
			name: null,
			listeners: {},
			
			send: function(target, event, data) { // Send Message object or create new message out of target, event and data
				var message = messageFactory.check(target) && target || messageFactory.create(target, event, data);
				
				receivers[new MessageMan(target).name].forEach(function(receiver) {
					receiver.receive(message);
				});
			},
			on: function(event, listener) {
				if(typeof listener === "function")
					this.listeners[event] = listener;
			},
			receive: function(message) {
				var c;
				
				if(messageFactory.check(message) && message.receiver == this.name && typeof (c = this.listeners[message.event]) === "function")
					c(message.event, message.data);
			}
		};
	}

})();

/* File: client/js/panes/controllers/Panes.js */
(function(){
	angular.module("panes")
		.controller("panes.PanesController", PanesController);
	
	PanesController.$inject = ["$scope", "messageMan"];
	
	function PanesController($scope, messageMan) {
		
	}
	
	PanesController.prototype = {
		
	};
	
})();

/* File: client/js/themes/directives/themeInclude.js */
(function() {
	angular.module("themes")
		.directive("themeInclude", themeInclude);

	themeInclude.$inject = ["$compile", "themes.theme"];

	function themeInclude($compile, theme) {
		return {
			restrict: "E",
			link: function(scope, element, attrs) {
				if(!attrs.ngInclude)
					theme.getTheme().then(function(theme) {
						element.attr("ng-include", "'theme/" + (scope.$eval(attrs.src) || theme.html+".html") +"'");
						element.removeAttr("src");
						$compile(element)(scope);
					});
			}
		};
	}
	
})();

/* File: client/js/themes/directives/themeLink.js */
(function() {
	angular.module("themes")
		.directive("themeLink", themeLink);

	themeLink.$inject = ["$compile", "themes.theme"];

	function themeLink($compile, theme) {
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

	theme.$inject = ["$http"];

	function theme($http) {
		var themePromise = $http.get("/theme/manifest", { responseType:"json" }).then(function(result) {
			return result.data;
		});
		
		return {
			getTheme: function () {
				return themePromise;
			}
		};
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
		this.activateItem(this.items[0]);
		
		this.messageMan = messages.register(this);
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
		}
	};

})();
