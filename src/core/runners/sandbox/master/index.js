"use strict";

const api = require("./api");

api.route("name").then(res => console.log(`My name is ${res}!`), err => console.error(err));
