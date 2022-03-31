const path = require('path')

module.exports = {
    entry:['entry1.js','entry2.js'],
    context:__dirname,
    module: {
        rules: [
            {
                test: /\.js$/,
                include:['loader1.js']
            }
        ]
    },
    plugins: [`../plugin/plugin1.js`]
}