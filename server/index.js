module.exports = function start(root) {
	require("./config").root = root;

	require("./core");

	// Start HTTP server before socket server:
	var server = require("./http")(); // Starts HTTP server to serve rendered HTML templates + static files via express
	server.then(function(app) {
		require("./socket")(app); // Starts socket server that runs on top of the express app of the HTTP server
	});
};
