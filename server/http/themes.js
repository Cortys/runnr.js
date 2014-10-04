var config = require("../config"),
	express = require("express"),
	router = express.Router(),
	themes = require("../core/themes");

router.use("/raw", function(req, res, next) {
	res.set({
		"Access-Control-Allow-Origin": "*"
	});
	res.sendfile(themes.current.raw(req.url));
});

router.use(require("./apiSecurity"));

router.all("/manifest", function(req, res) {
	themes.current.manifest.then(function(manifest) {
		res.type("json");
		res.send(manifest);
	});
});

module.exports = router;
