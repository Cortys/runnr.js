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

api.offer(themes).redirect(themes.current).publish("theme");
console.log(api._routes);

module.exports = themes;
