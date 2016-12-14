"use strict";

const owe = require("owe.js");
const { mix, Mixin, Dedupe } = require("@runnr/mixin");
const { Assignable, filterObject } = require("@runnr/helpers");
const { UpdateEmitter } = require("@runnr/events");

const Persistable = require("../../../store/Persistable");

const { stageManager } = require("../../../managers");
const manage = require("../../manage");

const dependentNodes = Symbol("dependentNodes");
const exposed = Symbol("exposed");

const Plugin = Dedupe(Mixin(superclass => class extends mix(superclass).with(Assignable, Persistable(require("../../store")), UpdateEmitter()) {
	constructor() {
		super(...arguments);
		this[dependentNodes] = new Set();

		this.assigned.then(() => console.log(`Loaded plugin '${this.name}'.`));

		/* owe binding: */

		const exposedRoutes = ["id", "type", "name", "displayName", "version", "author", "source"];
		const publicRoutes = new Set([...exposedRoutes, "ports", "dependents", "update", "uninstall"]);
		const privateRoutes = new Set(publicRoutes);

		this[exposed] = { exposedRoutes, publicRoutes, privateRoutes };

		owe(this, owe.serve({
			router: {
				filter: owe.switch((destination, state) => {
					if(state.value !== this)
						return "deep";

					return state.origin.sandbox ? "private" : "public";
				}, {
					public: owe.filter(publicRoutes),
					private: owe.filter(privateRoutes),
					deep(destination, state) {
						return state.value.hasOwnProperty(destination);
					}
				}),
				deep: true,
				traversePrototype: true // Allow access to Plugin.prototype getters
			},
			closer: {
				filter: true
			}
		}));
		owe.expose.properties(this, exposedRoutes);
	}

	assign(preset, stages = {}) {
		return stageManager(Object.assign({}, stages, {
			setMetadata: () => {
				Object.keys(this).forEach(key => {
					if(key !== "$loki" && key !== "meta" && key !== "type")
						delete this[key];
				});

				Object.assign(this, filterObject(preset, [
					"$loki", "meta",
					"name", "displayName", "version", "author", "source"
				]));

				this.persist();

				if(typeof stages.setMetadata === "function")
					return Promise.resolve(stages.setMetadata())
						.then(() => this.persist());
			},
			validatePlugin: () => {
				const doValidate = typeof stages.validatePlugin === "function";

				console.log(`Assigned plugin '${this.name}' of type '${this.type}'. Validate: ${doValidate}.`);

				return doValidate
					? stages.validatePlugin()
					: stageManager.cancel;
			}
		}));
	}

	get id() {
		return this.$loki;
	}

	get dependents() {
		const result = {
			plugins: new Set(),
			runners: new Set()
		};

		this[dependentNodes].forEach(node => {
			result[node.graph.container instanceof Plugin
				? "plugins"
				: "runners"].add(node.graph.container);
		});

		return {
			plugins: [...result.plugins],
			runners: [...result.runners]
		};
	}

	get dependentNodes() {
		return this[dependentNodes].values();
	}

	addDependentNode(node) {
		this[dependentNodes].add(node);
	}

	deleteDependentNode(node) {
		this[dependentNodes].delete(node);
	}

	performOnDependentRunners(method) {
		return Promise.all(this.dependents.runners.map(method));
	}

	disableDependentRunnersUntil(promise) {
		return this.performOnDependentRunners(runner => runner.disableUntil(promise));
	}

	uninstall() {
		return manage.uninstall(this).then(result => {
			this[UpdateEmitter.delete]();

			return result;
		});
	}

	update() {
		return manage.update(this);
	}
}));

Plugin.exposed = exposed;

module.exports = Plugin;
