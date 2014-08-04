var settings = require("../core/settings.js"),
	express = require("express"),
	swig = require("swig"),
	app;

function start() {
	app = express();
	
	app.engine("swig", swig.renderFile);
	app.set("view engine", "swig");
	app.set("views", settings.root + "/views");
	
	app.set("view cache", false);
	swig.setDefaults({ cache: false });
	
	app.use(express.static(settings.root + "/static"));
	
	app.use("/", function(req, res) {
		res.render("index");
	});
	
	app.listen(settings.port);
	
	return app;
}

module.exports = start;