module.exports = function(grunt) {
  require("matchdep").filterAll("grunt-*").forEach(grunt.loadNpmTasks);
  var webpack = require("webpack");
  var webpackConfig = require("./webpack.config.js");
  grunt.initConfig({
    webpack: {
        options: webpackConfig,
        build: {
            plugins: webpackConfig.plugins.concat(
                new webpack.DefinePlugin({
                    "process.env": {
                        "NODE_ENV": JSON.stringify("production")
                    }
                }),
                new webpack.optimize.DedupePlugin(),
                new webpack.optimize.UglifyJsPlugin()
            )
        },
        "build-dev": {
            devtool: "sourcemap",
            debug: true
        }
    },
    "webpack-dev-server": {
        options: {
            webpack: webpackConfig,
            publicPath: "/" + webpackConfig.output.publicPath
        },
        start: {
            keepAlive: true,
            webpack: {
                devtool: "eval",
                debug: true
            }
        }
    },

    pkg: grunt.file.readJSON("package.json"),
    //tasks: [ "default", ['webpack-dev-server'] ],
    watch: {
      files: [ "./*.js","./test/*.js", "./README.md"],
      tasks: ["webpack:build-dev"],
      options: {
          spawn: false,
      },
      karma: {
            //files: [ "*.js","test/*.js"],
            files: [
                // TEMPORARY LOCATIONS!!!!
                '../underscore-unchained/bower_components/underscore/underscore.js',
                '../underscore-unchained/bower_components/1670507/underscoreAddon.js',
                '../underscore-unchained/underscore-unchained.js',
                '../supergroup/supergroup.js',
                'node_modules/d3/d3.js',
                //'../bower_components/underscore/underscore.js',
                //'../bower_components/1670507/underscoreAddon.js',
                //'../bower_components/underscore-unchained/underscore-unchained.js',
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
      }
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
  //grunt.loadNpmTasks("grunt-browserify");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-groc");
  //grunt.registerTask("default", ["karma"]);
  //grunt.loadNpmTasks('grunt-webpack');
  // The development server (the recommended option for development)
  grunt.registerTask("webpack-dev-server:start", []);
  grunt.registerTask("default", ["webpack-dev-server:start"]);

  // Build and watch cycle (another option for development)
  // Advantage: No server required, can run app from filesystem
  // Disadvantage: Requests are not blocked until bundle is available,
  //               can serve an old app on too fast refresh
  grunt.registerTask("dev", ["webpack:build-dev", "watch:app"]);
  
  // Production build
  grunt.registerTask("build", ["webpack:build"]);

};
