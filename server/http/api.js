var express = require("express"),
	router = express.Router(),
	querystring = require("querystring"),
	stream = require("stream"),
	api = require("../core/api");

// MAIN ROUTES:
require("./js")(api);
require("./frameworks")(api);

// API ROUTES:
require("./plugins");
require("./themes");

var problem = function(err) {
	if(typeof err != "object")
		return this.status(404).json({});
	Object.defineProperty(err, "message", { value:err.message, enumerable:true });
	Object.defineProperty(err, "type", { value:err.type, enumerable:true });
	this.status(404).json(err);
};

router.all("*", function(req, res, next) {
	var path = req.url,
		i = 0,
		l = path.length,
		location = path.charAt(0),
		word = "",

		go = function() {
			if(!word.length)
				return;
			req.api = req.api.route(querystring.unescape(word));
			word = "";
		};

	req.api = api;

	for(; i < l; location = path.charAt(++i)) {
		if(location == "/") {
			go();
			if(i > 0 && path.charAt(i-1) == "!")
				break;
		} else if(location != "!")
			word += location;
	}
	req.requestedContent = querystring.unescape(path.substr(i+1));
	next();
}).get("*", function(req, res, next) {

	res.set({
		"Access-Control-Allow-Origin": "*"
	});

	req.api.get(req.requestedContent).then(function(content) {

		if(content instanceof api.File) {
			return res.sendFile(content.path, function(err) {
				if(err && !res.headersSent)
					res.status(err.status || 404).end();
			});
		}

		if(content instanceof stream.Readable)
			return content.pipe(res);

		if(typeof content == "number")
			content += "";
		res.send(content);
	}).catch(problem.bind(res)).done();
});

module.exports = router;
