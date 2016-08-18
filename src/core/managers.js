"use strict";

module.exports = {
	taskManager: require("./helpers/taskManager")(),
	stageManager: require("./helpers/stageManager")(["setMetadata", "assignGraph", "validatePlugin", "activateRunner"])
};
