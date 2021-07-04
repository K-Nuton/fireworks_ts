module.exports = {
    devtool: false,

    mode: 'production',
    entry: './src/fireworks.ts',

    output: {
        library: "Fireworks",
        libraryTarget: "window",
        libraryExport: "default",
        filename: "fireworks.js"
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
};
