var settings = require("../core/settings.js"),
	express = express = require("express"),
	jsRouter = express.Router(),
	jsPath = settings.root + "/client/js",
	min = !settings.devMode && ".min" || "";

jsRouter.get("/runnr", function(req, res) {
	res.sendfile(jsPath + "/build/runnr"+min+".js");
});

module.exports = jsRouter;