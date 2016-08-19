"use strict";

module.exports = {
	taskManager: require("./helpers/taskManager")(),
	stageManager: require("./helpers/stageManager")({
		stages: ["setMetadata", "assignGraph", "validatePlugin", "activateRunner"],
		nonCriticalStages: ["validatePlugin", "activateRunner"]
	})
};
