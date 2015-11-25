"use strict";

const connector = require("./connector");

const runner = connector.master.route("runner");

const graph = runner.route("graph");

graph.route("nodes").then(console.log, console.error);
