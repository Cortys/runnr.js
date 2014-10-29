var path = require("path");

function File(paths) {
	Object.defineProperty(this, "path", { value:path.join.apply(path, arguments) });
}

module.exports = File;
