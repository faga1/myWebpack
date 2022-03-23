module.exports = {
    entry:['entry1.js','entry2.js'],
    context:'E:/项目/myWebpack/example/src/',
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