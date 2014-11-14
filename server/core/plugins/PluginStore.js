module.exports = function(Plugin) {

	function Store(plugin) { // store plugin in Plugin.store if not already stored.
		if(!(plugin instanceof Plugin))
			throw new Error("Only plugins can be stored in PluginStore.");

		return this.lookup(plugin, true) || (this.dictionary[plugin.id] = {
			plugin: plugin,
			refCount: 1
		});
	}

	Store.dictionary = {};

	Store.remove = function remove(plugin) {
		if(!(plugin instanceof Plugin))
			throw new Error("Only plugins can be removed from PluginStore.");
		var e = this.dictionary[plugin.id];
		if(e && e.refCount > 1)
			e.refCount--;
		else
			this.dictionary[plugin.id] = undefined;
	};

	Store.lookup = function lookup(plugin, increaseRefCount) {
		if(!(plugin instanceof Plugin))
			throw new Error("Only plugins can be looked up in PluginStore.");
		var e = this.dictionary[plugin.id];
		if(!e)
			return false;
		if(increaseRefCount)
			e.refCount++;
		return e.plugin;
	};

	return Store;
};
