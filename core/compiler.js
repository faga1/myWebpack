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
            entryObj.code = this.buildModule(item)
            entryObj.name = item;
            this.entry.push(entryObj)
        })
    }
    buildModule(modulePath){
        const originCode = fs.readFileSync(`../example/src/${modulePath}`,'utf-8')
        return originCode;
    }
}
