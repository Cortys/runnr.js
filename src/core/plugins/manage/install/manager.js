"use strict";

const owe = require("owe.js");

const generating = require("../../../helpers/generatingMaps");

const pluginTasks = new generating.Map(() => ({}));

function addTask(plugin, task) {
	const tasks = pluginTasks.forceGet(plugin);

	if(!tasks.current) {
		const done = () => {
			tasks.current = undefined;

			if(tasks.next) {
				tasks.next = undefined;
				addTask(plugin, tasks.next.task)
					.then(tasks.next.promise.resolve, tasks.next.promise.reject);
			}
			else
				pluginTasks.delete(plugin);
		};

		tasks.current = task();
		tasks.current.then(done, done);

		return tasks.current;
	}

	if(tasks.next)
		tasks.next.promise.reject(new owe.exposed.Error("This task was replaced by another one."));

	tasks.next = { task };

	const nextPromise = new Promise((resolve, reject) => tasks.next.promise = { resolve, reject });

	if(typeof tasks.current.cancel === "function")
		tasks.current.cancel();

	return nextPromise;
}

module.exports = { addTask };
