var config = require("../config"),
	jsPath = config.root + "/client/js/",
	min = !config.devMode && ".min" || "";

function js(api) {

	var o = {};

	api.chainedOffer(o).provider(
		api.serve.fs(function(file) {
			if(file == "runnr.js")
				return jsPath + "build/runnr"+min+".js";
			if(file == "runnr.js.map")
				return jsPath + "build/runnr"+min+".js.map";
			return jsPath + file;
		})
	).publish("js");
}

module.exports = js;
