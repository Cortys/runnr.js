(function() {
	angular.module("core")
		.factory("core.api", api);

	api.$inject = ["$q", "$http", "$location", "core.socket"];

	function api($q, $http, $location, socket) {

		function Api(name, parent) {
			this.name = name;
			this._parent = parent;

			this._depth = parent?parent._depth+1:1;

			this.url = new UrlEncoder(this);
		}

		Api.prototype = {

			name: null,
			url: null,
			_parent: null,
			_depth: 0,
			_routeCache: null,

			get _route() {
				return this._routeCache || (this._routeCache = this._parent?this._parent._route.concat([this.name]):[this.name]);
			},

			route: function(route) {
				return new Api(route, this);
			},

			get: function(content) {
				var t = this;
				console.log(t._route);
				return $http.get(t.url.get(content), {}).then(function(data) {
					return data.data;
				}, function(err) {
					return err.data;
				});
			},

			send: function(content, data) {

			}
		};

		function UrlEncoder(api) {
			this._api = api;
		}

		UrlEncoder.prototype = {

			_routeCache: null,

			get _route() {
				return this._routeCache || (this._routeCache = this._api._route.join("/"));
			},

			get: function(content) {
				return "/"+this._route+"?"+encodeURI(content);
			},

			send: function(content, data) {
				return "";
			}
		};

		return new Api("api", null);
	}
})();
