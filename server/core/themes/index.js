var config = require("../../config"),
	themeId = "light",

	Theme = require("./Theme"),

	currentTheme = new Theme(themeId),

themes = {
	get current() {
		return currentTheme;
	}
};

module.exports = themes;
