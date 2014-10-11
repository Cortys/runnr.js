var api = {
	version: 1,
	base: "",
	api: "/api"
};

api.default = "/";
api.license = "/license";

// Non exchangable content: '' prefix
api.js = {
	base: api.base+"/js",
	main: "/runnr.js",
	mainMap: "/runnr.js.map",
	connectors: {
		base: "/connectors",
		common: "/common.js",
		plugin: "/plugin.js",
		runner: "/runner.js"
	}
};
api.frameworks = {
	base: api.base+"/frameworks"
};

// Customizable content: '/api' prefix
api.themes = {
	base: api.api+"/theme",
	manifest: "/manifest",
	raw: "/raw"
};
api.plugins = {
	base: api.api+"/plugins",
	all: "/all",
	plugin: {
		manifest: "/manifest",
		client: "/client"
	}
};

Object.freeze(api);

module.exports = api;
