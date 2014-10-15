var socketIo = require("socket.io"),
	cookie = require("cookie"),
	signature = require("cookie-signature"),
	config = require("../config"),
	api = require("../api");

function start(app) {
	var io = socketIo(app);

	io.use(function(socket, next) {
		var handshake = socket.handshake;

		if(handshake.headers.cookie) {
			handshake.cookie = cookie.parse(handshake.headers.cookie);
			handshake.session = signature.unsign(handshake.cookie["connect.sid"].slice(2), app.sessionSecret);
			if(handshake.session)
				return next();
		}
		console.error("Socket connection denied. "+socket.id);
	});

	io.on("connection", function(socket) {
		console.log("Socket connected. "+socket.id);
	});
}

module.exports = start;
