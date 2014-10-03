var config = require("../config"),
	express = require("express"),
	router = express.Router();

function err(res) {
	res.status(401).send("You are not authorized to access this content.");
}

router.use(require("body-parser").json());

router.use(function(req, res, next) {
	if(req.method != "GET" && req.body && req.body.api)
		next();
	else
		err(res);
});

module.exports = router;
