"use strict";

const request = require("./request");

request(["name"]).then(res => console.log(`My name is ${res}!`), err => console.error(err));
