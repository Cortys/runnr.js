var config = require("../config.js"),
	express = express = require("express"),
	plugins = require("../core/plugins/plugins.js"),
	router = express.Router();

router.param("id", function(req, res, next, id) {
	plugins.get(id).then(function(data) {
		req.id = id;
		req.data = data;
		next();
	}, function(err) {
		res.status(404).json({});
	});
});

router.route("/all").get(function(req, res) {
	plugins.getAll({ "_id":true, "author":true }).then(function(data) {
		res.json(data);
	}, function() {
		res.status(404).json([]);
	});
})

router.get("/:id/manifest", function(req, res) {
	res.json(req.data);
});

module.exports = router;