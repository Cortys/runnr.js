var config = require("../config.js"),
	express = express = require("express"),
	router = express.Router(),
	themeId = "light",
	themePath = config.root + "/themes/" + themeId;

router.use(express.static(themePath));

router.get("/manifest", function(req, res) {
	res.sendfile("manifest.json", {
		root: themePath
	});
});

module.exports = router;