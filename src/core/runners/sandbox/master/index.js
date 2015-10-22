"use strict";

const api = require("../api/client")(process);

const graph = api.route("graph");

api.route("name").then(res => console.log(`My name is ${res}!`), err => console.error(err));
graph.route("nodes", 1, "plugin", "mainLocation").then(res => console.log(`My plugin location is ${res}!`), err => console.error(err));
