module.exports = {
    entry: './sequence-viz-spec.js',
    output: {
        path: './',
        filename: './bundle.js',
    },
    resolve: {
        alias: { 
            moment: './node_modules/moment/moment.js',
            lodash: './node_modules/lodash/index.js',
            underscore: './node_modules/underscore/underscore.js'
        },
        modulesDirectories: ['..','../node_modules'],
    },
    //devtool:"eval",
    devtool: "source-map",
    //watch: true,
    colors: true,
    progress: true,
    cache: false,
    debug: true
};
