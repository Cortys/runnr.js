module.exports = function(grunt) {
	var path = require("path");

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		stylus: {
			compile: {
				options: {
					compress: true,
					"resolve url": true,
					"include css": true
				},
				files: {
					"themes/light/desktop.css": "themes/light/desktop.styl",
					"themes/light/plugin.css": "themes/light/plugin.styl"
				}
			}
		},
		webfont: {
			icons: {
				src: ["themes/light/img/**/*.svg", "!themes/light/img/build/**/*.svg", "!themes/light/img/logo.svg"],
				dest: "themes/light/img/build",
				options: {
					templateOptions: {
						baseClass: "icon",
						classPrefix: "icon_",
						mixinPrefix: "icon-"
					},
					stylesheet: "styl",
					descent: 0,
					ascent: 0,
					rename: function(name) {
						var p = path.dirname(name).split(path.sep).slice(3).join("-");
						return (p && p+"-" || "") + path.basename(name);
					}
				}
			}
		},
		uglify: {
			client: {
				files: [{
					expand: true,
					cwd: "client/js/build/",
					src: ["**/*.js", "!*.min.js"],
					dest: "client/js/build",
					ext: ".min.js"
				}, {
					expand: true,
					cwd: "client/js/",
					src: ["pluginConnector.js"],
					dest: "client/js/build",
					ext: ".min.js"
				}]
			}
		},
		concat: {
			js: {
				options: {
					banner: "'use strict';\n\n",
					sourceMap: true
				},
				src: ["client/js/runnr.js", "client/js/*/*.js", "client/js/*/*/**/*.js", "!client/js/build/*.js"],
				dest: "client/js/build/runnr.js",
			}
		},
		watch: {
			client: {
				files: ["client/**/*.js", "!client/**/build/*.js"],
				tasks: ["concat:js","uglify:client"]
			},
			theme: {
				files: "themes/**/*.styl",
				tasks: ["stylus"]
			},
			icons: {
				files: "themes/light/img/**/*.svg",
				tasks: ["webfont", "stylus"]
			}
		},
		nodemon: {
			normal: {
				script: "start.js",
				options: {
					watch: ["server"],
					args: []
				}
			},
			dev: {
				script: "start.js",
				options: {
					watch: ["server"],
					args: ["dev"]
				}
			}
		},
		concurrent: {
			normal: {
				tasks: ["watch", "nodemon:normal"],
				options: {
					logConcurrentOutput: true
				}
			},
			dev: {
				tasks: ["watch", "nodemon:dev"],
				options: {
					logConcurrentOutput: true
				}
			}
		}
	});

	require("load-grunt-tasks")(grunt);

	grunt.registerTask("default", ["concurrent:normal"]);
	grunt.registerTask("dev", ["concurrent:dev"]);
	grunt.registerTask("build", ["webfont", "stylus", "uglify", "concat"]);
};
