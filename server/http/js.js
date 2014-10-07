var config = require("../config"),
	express = require("express"),
	router = express.Router(),
	jsPath = config.root + "/client/js/",
	min = !config.devMode && ".min" || "";


router.get("/runnr.js", function(req, res) {
	res.sendfile(jsPath + "build/runnr"+min+".js");
});

router.get("/plugins/connector.js", function(req, res, next) {
	res.sendfile(jsPath + (config.devMode?"":"build/")+"pluginConnector"+min+".js");
});

if(config.devMode)
	router.get("/runnr.js.map", function(req, res) {
		res.sendfile(jsPath + "build/runnr.js.map");
	});

module.exports = router;
