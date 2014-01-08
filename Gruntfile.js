module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    watch: {
      files: [ "./*.js","./test/*.js", "./README.md"],
      karma: {
            //files: [ "*.js","test/*.js"],
            files: [
                // TEMPORARY LOCATIONS!!!!
                '../underscore-unchained/bower_components/underscore/underscore.js',
                '../underscore-unchained/bower_components/1670507/underscoreAddon.js',
                '../underscore-unchained/src/underscore-unchained.js',
                '../supergroup/supergroup.js',
                'node_modules/d3/d3.js',
                //'../bower_components/underscore/underscore.js',
                //'../bower_components/1670507/underscoreAddon.js',
                //'../bower_components/underscore-unchained/src/underscore-unchained.js',
                //'../supergroup.js',
                'bower_components/momentjs/moment.js',
                'evtData.js',
                'lifeflowData.js',
                'test/*.js'
                //, {pattern: './hurricane.csv', included: false}
                //, {pattern: './base/hurricane.csv', included: false}
            ],
            //verbose: true,
            tasks: ['karma:unit:run'] //NOTE the :run flag
      },
      tasks: [ ]
      //tasks: [ "groc" ]
    },
    groc: {
        javascript: [ "./supergroup.js", "README.md" ],
        options: { "out": "doc/" }
    },
    jshint: {
        all: ["Gruntfile.js", "./supergroup.js", "test/**/*.js"]
        , options: { laxcomma: true }
    },
    karma: {
        unit: {
            configFile: './test/karma.conf.js',
            browsers: ['PhantomJS'],
            background: true
        }
        //basePath: "test",
    }
  });
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-karma");
  grunt.loadNpmTasks("grunt-browserify");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-groc");
  grunt.registerTask("default", ["karma"]);
};
