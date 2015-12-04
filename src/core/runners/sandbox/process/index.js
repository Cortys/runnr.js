"use strict";

const connector = require("./connector");
const Runner = require("./runner/Runner");

connector.register("nodes", new Runner(connector.master.route("runner", "graph")));
