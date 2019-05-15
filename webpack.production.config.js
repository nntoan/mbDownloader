/* eslint-env node */
const path = require('path');

const webpack = require('webpack');
const PACKAGE = require('./package.json');
const banner = `${PACKAGE.name} - ${PACKAGE.version} | (c) 2019 ${PACKAGE.author} | ${PACKAGE.license} | ${PACKAGE.homepage}`;

module.exports = {
    mode: 'production',
    target: 'web',
    node: {
        fs: 'empty'
    },
    entry: './src/mbDownloader.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'mbDownloader.min.js',
        library: 'mbDownloader',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    resolve: {
        extensions: ['.js', '.ejs']
    },
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
        new webpack.BannerPlugin(banner),
        new webpack.ProvidePlugin({
            '$': 'jquery',
            'jQuery': 'jquery',
            'windows.jQuery': 'jquery',
        }),
    ]
};
