var ApiRoot = require("./ApiRoot");

function Api(name, root) {
	return new ApiRoot(name, root);
}

module.exports = Api;
