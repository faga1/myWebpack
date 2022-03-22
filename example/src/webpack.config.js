module.exports = {
    entry:['entry1.js','entry2.js'],
    module: {
        rules: [
            {
                test: /\.css?$/,
                include:['../../loader/cssloader.js']
            }
        ]
    },
    plugins: [`../plugin/plugin1.js`]
}