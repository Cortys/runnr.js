(function() {
	angular.module("core")
	.factory("core.Cache", CacheFactory);

	CacheFactory.$inject = ["$q"];

	function CacheFactory($q) {

		function Cache(minHits) {
			this._entries = {};

			this._minHits = minHits;
		}

		Cache.prototype = {
			_entries: null,
			_minHits: 0,

			lookup: function(key, hit) {
				var t = this;
				return $q.when(t._entries[key]).then(function(entry) {
					if(!entry) {
						t._entries[key] = {
							empty: true,
							data: undefined,
							hits: 0
						};
						return $q.reject(0);
					}
					if(entry.empty)
						return $q.reject(0);
					return entry;
				}).then(function(entry) {
					return entry.data;
				}, function() {
					if(typeof hit !== "function")
						return $.reject(new Error("No cache entry found for key '"+key+"'."));

					var entry = t._entries[key],
						result = hit();

					console.log(entry);

					if(++entry.hits >= t._minHits) {
						entry.empty = false;
						entry.data = result;
					}
					return result;
				});
			}
		};

		return Cache;
	}
}());
