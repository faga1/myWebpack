const path = require('path')
const fs = require('fs')
const options = require('../example/src/webpack.config')
const compiler = require('./compiler.js')
module.exports = function webpack(){
    let instance = new compiler(options)
    loadPlugin(instance)
    instance.run()
}
function loadPlugin(compiler){
    options.plugins.forEach((item)=>{
        const temp = require(item)
        let pluginInstance = new temp(compiler)
        pluginInstance.apply()
    })
}