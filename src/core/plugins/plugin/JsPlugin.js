"use strict";

const { mixins } = require("mixwith");

const FsPlugin = require("./FsPlugin");

class JsPlugin extends mixins(FsPlugin) {}

module.exports = JsPlugin;
