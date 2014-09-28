var config = require("../config"),
	express = require("express"),
	https = require("https"),
	security = require("../core/security"),
	app;

function start() {
	app = express();

	// STATIC SERVICES:

	app.use("/frameworks", express.static(config.root + "/bower_components"));

	app.get("/license", function(req, res) {
		res.sendfile("LICENSE", {
			root: config.root,
			headers: {
				"Content-Type": "text/plain"
			}
		});
	});

	app.use("/js", require("./js"));

	app.use("/api/theme", require("./theme"));

	app.use("/api/plugins", require("./plugins"));

	app.use(express.static(config.root + "/client"));

	security.get().then(function(key) {
		https.createServer({
			key: key.serviceKey,
			cert: key.certificate,
			ca: key.certificate,
			rejectUnauthorized: false,
			requestCert: false
		}, app).listen(config.port);
	}, function(err) {
		console.error("Could not start HTTPS server. "+err);
	});

	return app;
}

module.exports = start;
