var socketIo = require("socket.io"),
	config = require("../config"),
	api = require("../api");

function start(app) {
	var io = socketIo(app);

	io.use(function(socket, next) {
		
	});

	io.on("connection", function(socket) {

	});
}

module.exports = start;
