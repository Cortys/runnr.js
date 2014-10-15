var config = require("../config"),
	crypto = require("crypto"),
	express = require("express"),
	session = require("express-session"),
	swig = require("swig"),
	https = require("https"),
	security = require("../core/security"),
	api = require("../api"),
	app, secret;

function start() {
	app = express();
	console.log("Starting HTTP server.");
	try {
		// Use sessions:

		secret = crypto.randomBytes(256).toString();

		app.use(session({
			secret: secret,
			cookie: { path: "/", httpOnly: true, secure: true, maxAge: null },
			resave: true,
			saveUninitialized: true
		}));
	} catch(err) {
		console.error("Starting HTTP server failed, due to insufficient session security entropy. Reattempting...");
		setTimeout(start, 5);
		return;
	}

	// Set Default headers:
	app.use(function(req, res, next) {
		res.set({
			"Content-Security-Policy": "default-src 'self'", // Only access resources that are part of runnr.js (limit on request)
			"Access-Control-Allow-Origin": req.protocol+"://"+req.hostname, // Only grant runnr.js pages access to resources (limit on response)
			"X-Frame-Options": "DENY" // Never render runnr.js pages in frames (limit on response) - plugin pages are not affected because of srcdoc-iframes
		});
		next();
	});

	// License:
	app.get(api.license, function(req, res) {
		res.sendfile("LICENSE", {
			root: config.root,
			lastModified: false,
			headers: {
				"Content-Type": "text/plain"
			}
		});
	});

	// Content:
	app.use(api.frameworks.base, express.static(config.root + "/bower_components"));

	app.use(api.js.base, require("./js"));

	app.use(api.themes.base, require("./themes"));

	app.use(api.plugins.base, require("./plugins"));

	app.get(api.api, function(req, res) {
		res.json(api);
	});

	// Main page:

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

	app.get(api.default, function(req, res, next) {
		res.set({
			"Content-Security-Policy": "style-src * 'unsafe-inline'; script-src * 'unsafe-eval'"
		});
		res.render("index", api);
	});

	// Start server:
	return security.get().then(function(key) {

		var server = https.createServer({
			key: key.serviceKey,
			cert: key.certificate,
			ca: key.certificate,
			rejectUnauthorized: false,
			requestCert: false
		}, app).listen(config.port, function() {
			console.log("Server started on port "+config.port+".");
		});

		server.sessionSecret = secret;

		return server;
	}, function(err) {
		console.error("Could not start HTTPS server. "+err);
	});

}

module.exports = start;
