"use strict";

const owe = require("owe.js");

const generating = require("../../helpers/generatingMaps");

const pluginTasks = new generating.Map(() => ({}));

function addTask(plugin, task) {
	const tasks = pluginTasks.forceGet(plugin);

	if(!tasks.current) {
		const done = () => {
			tasks.current = undefined;

			if(tasks.next) {
				addTask(plugin, tasks.next.task)
					.then(tasks.next.promise.resolve, tasks.next.promise.reject);
				tasks.next = undefined;
			}
			else
				pluginTasks.delete(plugin);
		};

		tasks.current = task();
		tasks.current.intent = task.intent;
		tasks.current.then(done, done);

		return tasks.current;
	}

	if(task.intent && tasks.current.intent === task.intent)
		return Promise.reject(new owe.exposed.Error(`There already is a running ${task.intent} task for this plugin.`));

	if(tasks.next)
		tasks.next.promise.reject(new owe.exposed.Error("This task was replaced by another one."));

	tasks.next = { task };

	const nextPromise = new Promise((resolve, reject) => tasks.next.promise = { resolve, reject });

	if(typeof tasks.current.cancel === "function")
		tasks.current.cancel();

	return nextPromise;
}

function taskify(task, map, intent) {
	if(!map)
		map = x => x;

	return Object.assign(function(plugin) {
		return addTask(map(plugin), () => task(...arguments));
	}, { intent });
}

function delay(plugin, promise, intent) {
	return new Promise((resolve, reject) => {
		addTask(plugin, Object.assign(() => {
			resolve();

			return promise;
		}, { intent })).catch(reject);
	});
}

module.exports = { addTask, taskify, delay };
