module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    browserify: {
      "./bundle.js": [ "./sequence-viz.js" ],
      "./test/bundle.js": [ "./test/sequence-viz-spec.js" ]
      , options: { 
            //transform: ["debowerify", "decomponentify", "deamdify", "deglobalify"],
      }
    },
    watch: {
      files: [ "./*.js", "./test/*spec.js","./README.md"],
      tasks: [ "browserify" ]
    },
  /*
    groc: {
        javascript: [ "./supergroup.js", "./test/supergroup.spec.js","./README.md"],
        options: { "out": "doc/" }
    },
    jshint: {
        all: ["Gruntfile.js", "./supergroup.js", "test/** /*.js"]
        , options: { laxcomma: true }
    }
*/
  });
  grunt.loadNpmTasks("grunt-browserify");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-groc");
  grunt.registerTask("default", ["browserify" /*, "jshint", "groc" */]);
};
