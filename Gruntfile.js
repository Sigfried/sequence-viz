module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    watch: {
      files: [ "./*.js","./README.md"],
      tasks: [ "groc" ]
    },
    groc: {
        javascript: [ "./supergroup.js", "README.md" ],
        options: { "out": "doc/" }
    },
    jshint: {
        all: ["Gruntfile.js", "./supergroup.js", "test/**/*.js"]
        , options: { laxcomma: true }
    }
  });
  grunt.loadNpmTasks("grunt-browserify");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-groc");
  grunt.registerTask("default", ["groc"]);
};
