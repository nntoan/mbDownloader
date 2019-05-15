/* eslint-env node */
const path = require('path');

const webpack = require('webpack');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

module.exports = {
    mode: 'development',
    target: 'web',
    node: {
        fs: 'empty'
    },
    entry: './src/mbDownloader.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'mbDownloader.js',
        library: 'mbDownloader',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    resolve: {
        extensions: ['.js', '.ejs']
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, 'src')
                ],
                use: 'babel-loader'
            }
        ]
    },
    plugins: [
        new BrowserSyncPlugin({
            host: 'localhost',
            port: 3333,
            server: {
                baseDir: ['demo', 'dist']
            },
            files: ['demo', 'dist'],
            index: '_index.html'
        }),
        new webpack.ProvidePlugin({
            '$': 'jquery',
            'jQuery': 'jquery',
            'windows.jQuery': 'jquery',
        }),
    ]
};
