var socketIO = require("socket.io");

function start(app) {
	var io = socketIO(app);

	io.on("connection", function(socket) {
		
	});
}

module.exports = start;
