var path = require("path");

module.exports = {
	name: "Runnr.js",
	root: null,
	port: process.env.PORT || 3912,
	devMode: process.argv[2] == "dev",
	userData: path.join(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE, ".runnr.js")
};
