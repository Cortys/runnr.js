"use strict";

const api = require("./api");

api.route("name").then(res => console.log(`My name is ${res}!`), err => console.error(err));
api.route("graph").route("nodes").route(2).route("plugin").route("mainLocation").then(res => console.log(`My plugin location is ${res}!`), err => console.error(err));
