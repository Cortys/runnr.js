var settings = require("../core/settings.js"),
	express = express = require("express"),
	theme = express.Router(),
	themeId = "light",
	themePath = settings.root + "/themes/" + themeId;

theme.use(express.static(themePath));

theme.get("/manifest", function(req, res) {
	res.sendfile(themePath + "/manifest.json");
});

module.exports = theme;