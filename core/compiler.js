const { SyncHook } = require('tapable')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const unixPath = require('./utils')
const fs = require('fs')
const path = require('path')
module.exports = class compiler{
    constructor(options){
        this.options = options;
        this.hooks = {
            run: new SyncHook(),
            emit: new SyncHook(),
            done: new SyncHook()
        }
        this.rootPath = options.context || unixPath(process.cwd())
        this.entry = new Set()
        this.module = new Set()
        this.chunk = new Set()
        this.alreadyModule = new Set()
    }
    run(){
        this.hooks.run.call()
        this.buildEntry()
        this.buildChunk()
        console.log('entries',this.entry);
        console.log('chunk',this.chunk);
    }
    buildEntry(){
        this.options.entry.forEach(item=>{
            let entryObj= this.buildModule(item,this.rootPath+item)
            if(!path.isAbsolute(item)){
                entryObj.path = unixPath(path.join(this.rootPath,item))
            }
            entryObj.name = item.replace(/\.js$/g,'')
            this.entry.add(entryObj)
        })
    }
    buildModule(moduleName,modulePath){
        const originCode = fs.readFileSync(modulePath,'utf-8')
        const module = this.moduleCompiler(moduleName,modulePath,originCode)
        const completedCode = this.loadLoader(modulePath,originCode)
        module._source = completedCode
        return module;
    }
    // 获取文件的ast树
    moduleCompiler(moduleName,modulePath,code){
        const ast = parser.parse(code)
        const module = {
            name:moduleName,
            dependenices:new Set()
        }
        traverse(ast,{
            CallExpression:(nodePath)=>{
                if(nodePath.node.callee.name === 'require'){
                    const requirePath = nodePath.node.arguments[0].value;
                    const moduleDir = path.dirname(modulePath)
                    const moduleId = unixPath(path.resolve(moduleDir,requirePath))
                    if(this.alreadyModule.has(moduleId)) return
                    let requireModule = this.buildModule(requirePath,moduleId)
                    module.dependenices.add(requireModule)
                    this.module.add(requireModule)
                    this.alreadyModule.add(moduleId)
                }
            }
        })
        return module
    }
    loadLoader(moduleName,code){
        const rules = this.options.module.rules;
        rules.forEach(rule => {
            if(rule.test.test(moduleName)){
                rule.include.forEach(loaderPath => {
                    const loader = require(`../loader/${loaderPath}`)
                    code = loader(code)
                })
            }
        })
        return code
    }
    buildChunk(){
        const iterator = this.entry.entries()
        for(const entry of iterator){
            const chunk ={
                name:entry[0].name,
                dependenices:entry[0].dependenices,
                _source:entry[0]._source,
                module:new Set()
            }
            this.addMoudle(chunk.dependenices,chunk.module)
            this.chunk.add(chunk)
        }
    }
    addMoudle(dep,set){
        console.log(dep);
        const iterator = dep.entries()
        for(const module of iterator){
            if(module[0].dependenices.size){
                this.addMoudle(module[0].dependenices,set)
            }
            set.add(module)
        }
    }
    exportFile(){
        const iterator = this.chunk.entries()
        if(this.options.output&&this.options.optput.length){

        }
        for(const chunk of iterator){
            fs.writeSync(`${this.rootPath}output[${entry.name}]`,getSourceModule(entry))
        }
    }
    getSourceModule(entry){
        const {name,dependenices,_source,path} = entry
        return `
            (() => {

            })
        `
    }
}
