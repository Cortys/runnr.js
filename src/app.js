"use strict";

const core = require("./core/index.js");

const owe = require("owe.js");
const http = require("http");
const oweHttp = require("owe-http");

core.then(function(core) {
	const coreApi = owe.api(core);

	http.createServer(oweHttp(coreApi), {
		onError(err) {
			console.error(err);

			return err;
		},

		parseCloseData: oweHttp.parseCloseData.extended
	}).listen(3912);
}).catch(function(err) {
	console.error(err);
});
