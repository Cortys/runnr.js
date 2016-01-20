"use strict";

const owe = require("owe.js");

const generating = require("./generatingMaps");

function createManager() {
	const tasksMap = new generating.Map(() => ({}));

	function addTask(id, task, intent) {
		const tasks = tasksMap.forceGet(id);

		if(!tasks.current) {
			const done = () => {
				tasks.current = undefined;

				if(tasks.next) {
					addTask(id, tasks.next.task, tasks.next.intent)
						.then(tasks.next.promise.resolve, tasks.next.promise.reject);
					tasks.next = undefined;
				}
				else
					tasksMap.delete(id);
			};

			tasks.current = {
				task: task(),
				intent
			};
			tasks.current.task.then(done, done);

			return tasks.current.task;
		}

		if(intent && tasks.current.intent === intent)
			return Promise.reject(new owe.exposed.Error(`There already is a running ${intent} task for this item.`));

		if(tasks.next)
			tasks.next.promise.reject(new owe.exposed.Error("This task was replaced by another one."));

		tasks.next = { task, intent };

		const nextPromise = new Promise((resolve, reject) => tasks.next.promise = { resolve, reject });

		if(typeof tasks.current.task.cancel === "function")
			tasks.current.task.cancel();

		return nextPromise;
	}

	function taskify(task, map, intent) {
		if(!map)
			map = x => x;

		return function() {
			return addTask(map.apply(this, arguments), () => task.apply(this, arguments), intent);
		};
	}

	function delay(id, promise, intent) {
		return new Promise((resolve, reject) => {
			addTask(id, () => {
				resolve();

				return promise;
			}, intent).catch(reject);
		});
	}

	return { addTask, taskify, delay };
}

module.exports = createManager;
