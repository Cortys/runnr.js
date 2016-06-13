"use strict";

const owe = require("owe.js");
const http = require("http");
const oweHttp = require("owe-http");

const core = require("./core/index.js");

core.then(core => {
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

	process.once("SIGINT", () => exit("SIGINT"));
	process.once("SIGTERM", () => exit("SIGTERM"));
	process.once("SIGUSR2", restart);

	function exit(sig) {
		core.onExit().then(() => process.exit(), () => process.once(sig, () => exit(sig)));
	}

	function restart() {
		core.onExit().then(() => process.kill(process.pid, "SIGUSR2"), () => process.once("SIGUSR2", restart));
	}
}).catch(err => console.error(err));

process.on("unhandledRejection", err => console.error("Unhandled rejection", err.stack));
