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

			get parent() {
				return this._parent;
			},

			get _route() {
				var p;
				return this._routeCache || (
					p = [encodeURI(this.name)],
					this._routeCache = this._parent?this._parent._route.concat(p):p
				);
			},

			route: function(route) {
				return new Api(route, this);
			},

			get: function(content) {
				return $http.get(this.url.get(content), {}).then(function(data) {
					return data.data;
				}, function(err) {
					throw err.data;
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
			_absoluteCache: null,

			get route() {
				return this._routeCache || (this._routeCache = this._api._route.join("/"));
			},

			get absolute() {
				return this._absoluteCache || (this._absoluteCache = $location.protocol()+"://"+$location.host()+":"+location.port+this.route+"/");
			},

			get relative() {
				return this.route+"/";
			},

			get: function(content, absolute) {
				return this[absolute?"absolute":"relative"]+"/"+(content && encodeURI(content) || "");
			},

			getAbsolute: function(content) {
				return this.get(content, true);
			},

			send: function(content, data) {
				return "";
			}
		};

		var root = new Api("", null),
			start = root.route("api");

		start.root = root;

		return start;
	}
})();
