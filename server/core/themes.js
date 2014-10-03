var config = require("../config"),
	themeId = "light",

	Theme = require("./themes/Theme"),

	currentTheme = new Theme(themeId),

themes = {
	get current() {
		return currentTheme;
	}
};

module.exports = themes;
