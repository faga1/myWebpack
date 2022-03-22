const { SyncHook } = require('tapable')
const fs = require('fs')
module.exports = class compiler{
    constructor(options){
        this.options = options;
        this.hooks = {
            run: new SyncHook(),
            emit: new SyncHook(),
            done: new SyncHook()
        }
        this.entry = []
        this.module = []
    }
    run(){
        this.hooks.run.call()
        this.buildExport()
        console.log(this.entry);
    }
    buildExport(){
        this.options.entry.forEach(item=>{
            let entryObj={}
            entryObj.code = fs.readFileSync(`../example/src/${item}`)
            entryObj.name = item;
            this.entry.push(entryObj)
        })
    }
}
