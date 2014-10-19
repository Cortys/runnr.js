var config = require("../../config"),

	//api,

	api = require("../api/tools"),

	themeId = "light",

	Theme = require("./Theme"),

	currentTheme = new Theme(themeId),

themes = {
	get current() {
		return currentTheme;
	}
};

api.expose(themes, themes.current);

module.exports = themes;
