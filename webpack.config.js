module.exports = {
    entry: './main.js',
    output: {
        path: './',
        filename: 'sequence-viz.js',
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
