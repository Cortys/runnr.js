var settings = require("../core/settings.js"),
	express = require("express"),
	swig = require("swig"),
	app;

function start() {
	app = express();
	
	// SETTINGS:
	app.engine("swig", swig.renderFile);
	app.set("view engine", "swig");
	app.set("views", settings.root + "/client/pages");
	
	console.log(settings);
	
	// CACHING:
	app.set("view cache", false);
	swig.setDefaults({ cache: false });
	
	// STATIC SERVICES:
	app.use(express.static(settings.root + "/client"));
	
	app.listen(settings.port);
	
	return app;
}

module.exports = start;