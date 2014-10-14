var config = require("../config"),
	express = require("express"),
	router = express.Router(),
	api = require("../api").js,
	jsPath = config.root + "/client/js/",
	min = !config.devMode && ".min" || "";


router.get(api.main, function(req, res) {
	res.sendfile(jsPath + "build/runnr"+min+".js");
});

router.get(api.connectors.base+api.connectors.plugin, function(req, res, next) {
	res.sendfile(jsPath + (config.devMode?"":"build/")+"pluginConnector"+min+".js");
});

if(config.devMode)
	router.get(api.mainMap, function(req, res) {
		res.sendfile(jsPath + "build/runnr.js.map");
	});

module.exports = router;
