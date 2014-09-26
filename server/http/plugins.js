var config = require("../config.js"),
	express = express = require("express"),
	plugins = require("../core/plugins/plugins.js"),
	router = express.Router();

router.param("id", function(req, res, next, id) {
	req.plugin = plugins.get(id);
	next();
});

router.route("/all")
	.all(function(req, res) {
		plugins.getRaw({ "manifest.core":true }, { "manifest.author":1 }).then(function(data) {
			res.json(data);
		}, function() {
			res.status(404).json([]);
		});
	});

router.route("/:id/manifest").all(function(req, res) {
	req.plugin.manifest.then(function(manifest) {
		res.json(manifest);
	}, function(err) {
		res.status(404).send(err.message);
	});
});

router.route("/:id/client/html").all(function(req, res) {
	res.set("Content-Type", "text/html");
	req.plugin.client.html.then(function(html) {
		res.send(html);
	}, function(err) {
		res.status(404).send(err.message);
	});
});

module.exports = router;
