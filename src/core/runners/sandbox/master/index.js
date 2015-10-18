"use strict";

const request = require("./request");

request("test", Math.random()).then(res => console.log("success", res), err => console.error("error", err));
