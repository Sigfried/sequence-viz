module.exports = {
    entry: './sequence-viz-spec.js',
    output: {
        path: './',
        filename: './bundle.js',
    },
    resolve: {
        alias: { moment: 'moment/moment.js'},
        modulesDirectories: ['../node_modules'],
    },
    //devtool:"eval",
    devtool: "source-map",
    //watch: true,
    colors: true,
    progress: true,
    cache: true,
    debug: true
};
