var settings = require("../core/settings.js"),
	express = express = require("express"),
	plugins = require("../core/plugins/plugins.js"),
	router = express.Router();

router.param("id", function(req, res, next, id) {
	plugins.getAll(id).then(function(data) {
		req.id = id;
		req.data = data;
		next();
	}, function() {
		next(new Error("A plugin named '"+id+"' is not installed."));
	});
});

router.get("/:id/manifest", function(req, res) {
	res.json(req.data);
});

module.exports = router;