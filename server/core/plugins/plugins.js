var db = require("../db/db.js").plugins,
	
	plugins = {
		getAll: function() {
			return db.findDeferred({});
		},
		get: function(id) {
			return db.findDeferred({ id:id });
		}
	};

//db.ensureIndex({ fieldName:"id", unique:true });

module.exports = plugins;