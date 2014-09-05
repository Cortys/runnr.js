var config = require("../config.js"),
	express = require("express"),
	app;

function start() {
	app = express();

	// STATIC SERVICES:
	
	app.use("/frameworks", express.static(config.root + "/bower_components"));
	
	app.get("/license", function(req, res) {
		res.sendfile(config.root + "/LICENSE");
	});
	
	app.use("/js", require("./js.js"));
	
	app.use("/theme", require("./theme.js"));
	
	app.use("/plugins", require("./plugins.js"));
	
	app.use(express.static(config.root + "/client"));
	
	app.listen(config.port);

	return app;
}

module.exports = start;
