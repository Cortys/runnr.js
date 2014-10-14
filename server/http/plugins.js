var config = require("../config"),
	express = require("express"),
	plugins = require("../core/plugins"),
	api = require("../api"),
	Q = require("q"),
	router = express.Router();

router.param("id", function(req, res, next, id) {
	plugins.get(id).then(function(plugin) {
		req.plugin = plugin;
		next();
	}, function(err) {
		res.status(404).send();
	});
});

router.use("/:id"+api.plugins.plugin.client, function(req, res, next) {
	var file = req.path;
	(file=="/html"?req.plugin.client.html:req.plugin.client.raw(file)).then(function(rawFile) {
		var prefix;
		if(file == "/html") {
			prefix = function prefix(url) {
				return req.protocol+"://"+req.hostname+":"+config.port+url;
			};
			res.type("html");
			res.set({
				"Content-Security-Policy": "default-src "+prefix(api.frameworks.base+"/")+" "+prefix(api.themes.base+"/")+" "+prefix(api.plugins.base+"/"+req.plugin.id+"/")+" "+prefix(api.js.base+api.js.connectors.base+"/")+"; frame-src 'none'; connect-src 'none'"
			});
			res.send(rawFile);
		}
		else if(file != "manifest.json")
			return Q.ninvoke(res, "sendfile", rawFile).then(undefined, function(err) {
				throw err;
			});
		else
			next();
	}, undefined).then(undefined, function(err) {
		res.status(404).send();
	});
});

router.use(require("./apiSecurity"));

router.all("/:id"+api.plugins.plugin.manifest, function(req, res) {
	req.plugin.manifest.then(function(manifest) {
		res.json(manifest);
	}, function(err) {
		res.status(404).send();
	});
});

router.all(api.plugins.all, function(req, res) {
	plugins.getRaw({ "manifest.core":true }, { "manifest.author":1 }).then(function(data) {
		res.json(data);
	}, function() {
		res.status(404).json([]);
	});
});

module.exports = router;
