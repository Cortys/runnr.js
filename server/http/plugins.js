var config = require("../config"),
	express = require("express"),
	plugins = require("../core/plugins"),
	api = require("./api"),
	router = express.Router();

router.param("id", function(req, res, next, id) {
	plugins.get(id).then(function(plugin) {
		req.plugin = plugin;
		next();
	}, function(err) {
		res.status(404).send(err.message);
	});
});

router.param("rawFile", function(req, res, next, file) {
	(file=="html"?req.plugin.client.html:req.plugin.client.raw(file)).then(function(rawFile) {
		if(file == "html") {
			var prefix = function prefix(url) {
				return req.protocol+"://"+req.hostname+":"+config.port+url;
			};
			res.type("html");
			res.set({
				"Content-Security-Policy": "default-src "+prefix(api.frameworks+"/")+" "+prefix(api.themes+"/")+" "+prefix(api.plugins+"/"+req.plugin.id+"/")+" "+prefix(api.js+"/plugins/")+"; frame-src 'none'; connect-src 'none'"
			});
			res.send(rawFile);
		}
		else if(file != "manifest.json") {
			res.sendfile(rawFile);
		}
		else
			next();
	});
});

router.use("/:id/client/:rawFile", function(req, res) {});

router.use(require("./apiSecurity"));

router.route("/:id/manifest").all(function(req, res) {
	req.plugin.manifest.then(function(manifest) {
		res.json(manifest);
	}, function(err) {
		res.status(404).send(err.message);
	});
});

router.route("/all").all(function(req, res) {
	plugins.getRaw({ "manifest.core":true }, { "manifest.author":1 }).then(function(data) {
		res.json(data);
	}, function() {
		res.status(404).json([]);
	});
});

module.exports = router;
