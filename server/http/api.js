var express = require("express"),
	router = express.Router(),
	querystring = require("querystring"),
	stream = require("stream"),
	api = require("../core/api");

router.all("*", function(req, res, next) {
	var routes = req.path.split("/");
	req.api = api;
	routes.forEach(function(location) {
		if(location) {
			req.api = req.api.route(location);
			if(location == "theme")
				req.getEnabled = true;
		}
	});
	next();
}).get("*", function(req, res, next) {
	if(!req.getEnabled)
		return res.status(404).send();
	var i = req.url.indexOf("?"),
		content = i<0?undefined:querystring.unescape(req.url.substr(i+1));
	req.api.get(content).then(function(content) {
		if(content instanceof stream.Readable) {
			console.log(content);
			setTimeout(function() {
				content.on("error", function(err) {
					res.status(404).send();
				});
			}, 500);
			return content.pipe(res);
		}
		if(typeof content == "number")
			content += "";
		res.send(content);
	}, function(err) {
		if(typeof err != "object")
			return res.status(404).json({});
		Object.defineProperty(err, "message", { value:err.message, enumerable:true });
		Object.defineProperty(err, "type", { value:err.type, enumerable:true });
		res.status(404).json(err);
	});
}).put("*", function(req, res, next) {

});

module.exports = router;
