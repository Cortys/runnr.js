var settings = require("../core/settings.js"),
	express = require("express"),
	exphbs = require("express3-handlebars"),
	app, hbs;

function start() {
	app = express();
	hbs = exphbs.create({});
	
	app.engine('handlebars', hbs.engine);
	app.set('view engine', 'handlebars');
	
	app.use("/", function(req, res, next) {
		
	});
	
	app.listen(settings.port);
}

start.data = {
	get app() {
		return app;
	}
};

module.exports = start;