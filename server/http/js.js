var config = require("../config.js"),
	express = express = require("express"),
	router = express.Router(),
	jsPath = config.root + "/client/js",
	min = !config.devMode && ".min" || "";

router.get("/runnr.js", function(req, res) {
	res.sendfile(jsPath + "/build/runnr"+min+".js");
});

if(config.devMode)
	router.get("/runnr.js.map", function(req, res) {
		res.sendfile(jsPath + "/build/runnr.js.map");
	});

module.exports = router;