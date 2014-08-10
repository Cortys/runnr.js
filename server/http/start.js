var settings = require("../core/settings.js"),
	express = require("express"),
	app;

function start() {
	app = express();

	// STATIC SERVICES:
	app.use(express.static(settings.root + "/client"));
	app.use("/themes", express.static(settings.root + "/themes"));

	app.get("/license", function(req, res) {
		res.sendfile(settings.root + "/LICENSE");
	});

	app.listen(settings.port);

	return app;
}

module.exports = start;
