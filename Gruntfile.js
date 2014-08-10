module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		stylus: {
			compile: {
				options: {
					compress: true
				},
				files: {
					"themes/light/desktop.css": "themes/light/desktop.styl"
				}
			}
		},
		concat: {
			js: {
				options: {
					separator: "\n"
				},
				src: ["client/js/*.js"],
				dest: "client/js/build/runnr.js"
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
				}]
			}
		},
		watch: {
			client: {
				files: ["client/**/*.js", "!client/**/build/*.js"],
				tasks: ["concat","uglify"]
			},
			theme: {
				files: "themes/**/*.styl",
				tasks: ["stylus"]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-stylus');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask("default", ["watch"]);
	grunt.registerTask("build", ["stylus", "concat", "uglify"]);
};
