"use strict";

module.exports = function filterObject(object, filter) {
	if(!object || typeof object !== "object")
		return {};

	const result = {};

	for(const key of filter)
		if(Object.prototype.hasOwnProperty.call(object, key))
			result[key] = object[key];

	return result;
};
