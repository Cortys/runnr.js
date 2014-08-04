module.exports = function start(root) {
	require("./core/settings.js").root = root;
	
	// Start HTTP server before socket server:
	var app = require("./http/start.js")(); // Starts HTTP server to serve rendered HTML templates + static files via express
	require("./socket/start.js")(app); // Starts socket server that runs on top of the express app of the HTTP server
};