module.exports = {
    devtool: false,

    mode: 'production',
    entry: './src/fireworks.ts',

    output: {
        library: "Fireworks",
        libraryTarget: "umd",
        filename: "fireworks.min.js"
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
            },
        ],
    },
    resolve: {
        extensions: [
            '.ts', '.js',
        ],
    },
    performance: {
        maxAssetSize: 320000,
        maxEntrypointSize: 400000,
    }
};
