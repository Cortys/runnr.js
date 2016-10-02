"use strict";

const owe = require("owe.js");
const http = require("http");
const oweHttp = require("owe-http");

const core = require("./core");

core.start().then(() => {
	const coreApi = owe.api(core);

	http.createServer(oweHttp(coreApi, {
		onError(req, res, err) {
			if(!err)
				return;

			console.error(err.stack);

			return err;
		},

		parseCloseData: owe.switch(request => request.method, {
			POST: oweHttp.parseCloseData.body
		})
	})).listen(3912);

	process.once("SIGINT", () => stop("SIGINT"));
	process.once("SIGTERM", () => stop("SIGTERM"));
	process.once("SIGUSR2", restart);

	function stop(sig) {
		core.stop().then(() => process.exit(), () => process.once(sig, () => stop(sig)));
	}

	function restart() {
		console.log("Restarting...");

		core.stop().then(() => process.kill(process.pid, "SIGUSR2"), () => process.once("SIGUSR2", restart));
	}
}).catch(err => console.error(err));

process.on("unhandledRejection", err => console.error("Unhandled Rejection:", err.stack));
