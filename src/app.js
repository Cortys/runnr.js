"use strict";

const core = require("./core/index.js");

const owe = require("owe.js");
const http = require("http");
const oweHttp = require("owe-http");

core.then(function(core) {
	const coreApi = owe.api(core);

	http.createServer(oweHttp(coreApi, {
		onError(req, res, err) {
			console.error(err.stack);

			const data = owe.resourceData(err);

			if(data && data.expose)
				Object.defineProperty(err, "message", {
					value: err.message,
					enumerable: true
				});

			return err;
		},

		parseCloseData: {
			GET: oweHttp.parseCloseData.extended,
			POST: oweHttp.parseCloseData.body
		}
	})).listen(3912);
}).catch(function(err) {
	console.error(err);
});
