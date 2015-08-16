"use strict";

const config = require("../config");
const Loki = require("lokijs");

const db = new Loki(config.fromUserData("store.db"), {
	autosave: true
});

module.exports = db;
