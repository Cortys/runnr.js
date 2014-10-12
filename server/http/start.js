var config = require("../config"),
	express = require("express"),
	swig = require("swig"),
	https = require("https"),
	security = require("../core/security"),
	api = require("./api"),
	app;

function start() {
	app = express();

	app.use(function(req, res, next) {
		res.set({
			"Content-Security-Policy": "default-src 'self'", // Only access resources that are part of runnr.js (limit on request)
			"Access-Control-Allow-Origin": req.protocol+"://"+req.hostname, // Only grant runnr.js pages access to resources (limit on response)
			"X-Frame-Options": "DENY" // Never render runnr.js pages in frames - plugin pages are not affected because of srcdoc-iframes (limit on response)
		});
		next();
	});

	app.get(api.license, function(req, res) {
		res.sendfile("LICENSE", {
			root: config.root,
			lastModified: false,
			headers: {
				"Content-Type": "text/plain"
			}
		});
	});

	app.use(api.frameworks.base, express.static(config.root + "/bower_components"));

	app.use(api.js.base, require("./js"));

	app.use(api.themes.base, require("./themes"));

	app.use(api.plugins.base, require("./plugins"));

	app.get(api.api, function(req, res) {
		res.json(api);
	});

	// MAIN PAGE:

	app.engine("html", swig.renderFile);

	app.set("view engine", "html");
	app.set("view cache", true);

	swig.setDefaults({
		varControls: ["{{{{", "}}}}"],
		tagControls: ["{{{%", "%}}}"],
		cmtControls: ["{{{#", "#}}}"],
		cache: false
	});

	app.set("views", config.root+ "/client");

	app.use(api.default, function(req, res, next) {
		res.set({
			"Content-Security-Policy": "style-src * 'unsafe-inline'; script-src * 'unsafe-eval'"
		});
		res.render("index", api);
	});

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
