var config = require("../config"),
	express = require("express"),
	router = express.Router(),
	api = require("./api").themes,
	Q = require("q"),
	themes = require("../core/themes");

router.use(api.raw, function(req, res, next) {
	Q.ninvoke(res, "sendfile", themes.current.raw(req.url), {
		headers: {
			"Access-Control-Allow-Origin": "*"
		}
	}).then(undefined, function(err) {
		res.status(404).send();
	});
});

router.use(require("./apiSecurity"));

router.all(api.manifest, function(req, res) {
	themes.current.manifest.then(function(manifest) {
		res.type("json");
		res.send(manifest);
	});
});

module.exports = router;
