var api = {
	version: 1,
	base: "",
	api: "/api"
};

api.default = api.base+"/";
api.js = api.base+"/js";
api.frameworks = api.base+"/frameworks";
api.license = api.base+"/license";

api.themes = api.api+"/theme";
api.plugins = api.api+"/plugins";

Object.freeze(api);

module.exports = api;
