var settings = require("../core/settings.js"),
	express = express = require("express"),
	router = express.Router(),
	jsPath = settings.root + "/client/js",
	min = !settings.devMode && ".min" || "";

router.get("/runnr.js", function(req, res) {
	res.sendfile(jsPath + "/build/runnr"+min+".js");
});

if(settings.devMode)
	router.get("/runnr.js.map", function(req, res) {
		res.sendfile(jsPath + "/build/runnr.js.map");
	});

module.exports = router;