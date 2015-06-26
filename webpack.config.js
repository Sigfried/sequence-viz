module.exports = {
    entry: './sequence-viz.js',
    output: {
        path: './',
        filename: 'bundle.js',
    },
    resolve: {
        alias: { moment: 'moment/moment.js'},
        modulesDirectories: ['node_modules'],
    },
    //plugins: ['concat'],
    //devtool:"eval",
    devtool: "source-map",
    //watch: true,
    colors: true,
    progress: true,
    cache: false,
    debug: true
};
