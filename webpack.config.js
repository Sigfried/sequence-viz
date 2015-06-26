module.exports = {
    entry: './sequence-viz.js',
    output: {
        path: './',
        filename: 'bundle.js',
    },
    resolve: {
        alias: { moment: 'moment/moment.js'},
        modulesDirectories: ['node_modules', 'bower_components'],
    },
    plugins: ['concat'],
    //devtool:"eval",
    devtool: "source-map",
    //watch: true,
    colors: true,
    progress: true,
    cache: false,
    debug: true
};
