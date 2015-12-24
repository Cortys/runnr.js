"use strict";

const core = require("./core/index.js");

const owe = require("owe.js");
const http = require("http");
const oweHttp = require("owe-http");

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

	function addExitListeners() {
		process.once("SIGINT", exit);
		process.once("SIGTERM", exit);
		process.once("SIGUSR2", restart);
	}

	addExitListeners();

	function exit() {
		core.onExit().then(() => process.exit(), addExitListeners);
	}

	function restart() {
		core.onExit().then(() => process.kill(process.pid, "SIGUSR2"), addExitListeners);
	}
}).catch(err => console.error(err));

process.on("unhandledRejection", err => console.error(`Unhandled rejection ${err.stack}`));
