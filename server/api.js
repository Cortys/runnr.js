var api = {
	version: 1,
	base: "",
	api: "/api"
};

api.default = api.base+"/";
api.license = api.base+"/license";

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
	base: api.base+"/frameworks",
	socket: "/socket.io"
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
