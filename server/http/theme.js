var settings = require("../core/settings.js"),
	express = express = require("express"),
	router = express.Router(),
	themeId = "light",
	themePath = settings.root + "/themes/" + themeId;

router.use(express.static(themePath));

router.get("/manifest", function(req, res) {
	res.sendfile(themePath + "/manifest.json");
});

module.exports = router;