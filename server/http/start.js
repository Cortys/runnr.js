var settings = require("../core/settings.js"),
	express = require("express"),
	app;

function start() {
	app = express();

	// STATIC SERVICES:
	app.use(express.static(settings.root + "/client"));
	
	app.use("/js", require("./js.js"));
	
	app.use("/theme", require("./theme.js"));
	
	app.use("/frameworks", express.static(settings.root + "/bower_components"))
	
	app.get("/license", function(req, res) {
		res.sendfile(settings.root + "/LICENSE");
	});

	app.listen(settings.port);

	return app;
}

module.exports = start;
