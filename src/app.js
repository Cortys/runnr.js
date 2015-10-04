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
				return err;

			console.error(err.stack);

			return err;
		},

		parseCloseData: {
			GET: () => undefined,
			POST: oweHttp.parseCloseData.body
		}
	})).listen(3912);

	process.on("SIGINT", exit);
	process.on("SIGTERM", exit);

	function exit() {
		core.onExit().then(() => process.exit());
	}

}).catch(err => console.error(err));
