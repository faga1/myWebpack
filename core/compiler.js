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
        this.assets = {}
        this.files = new Set()
    }
    run(){
        this.hooks.run.call()
        this.buildEntry()
        this.buildChunk()
        this.exportFile()
    }
    buildEntry(){
        this.options.entry.forEach(item=>{
            let entryObj= this.buildModule(item,this.rootPath+item)

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
            id:modulePath,
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
                id:entry[0].id,
                _source:entry[0]._source,
                modules:[]
            }
            this.addMoudle(chunk.dependenices,chunk.modules)
            this.chunk.add(chunk)
        }
    }
    addMoudle(dep,arr){
        const iterator = dep.entries()
        for(const module of iterator){
            if(module[0].dependenices.size){
                this.addMoudle(module[0].dependenices,arr)
            }
            arr.push(module[0])
        }
    }
    exportFile(){
        const iterator = this.chunk.entries()
        for(const chunk of iterator){
            this.assets[chunk[0].name] = this.getSourceModule(chunk[0])
            
        }
        this.hooks.emit.call()  
        Object.keys(this.assets).forEach(item=>{
            this.files.add(item)
            if(!fs.readdirSync(`${this.rootPath}/dist`)) fs.mkdirSync(`${this.rootPath}/dist`)
            fs.writeFileSync(`${this.rootPath}dist/output[${item}].js`,this.assets[item])
        })
    }
    getSourceModule(chunk){
        console.log(chunk);
        const {name,dependenices,_source,path,modules} = chunk
        return `
        (() => {
            var __webpack_modules__ = {
              ${modules
                .map((module) => {
                  return `
                  '${module.id}': (module) => {
                    ${module._source}
              }
                `;
                })
                .join(',')}
            };
            // The module cache
            var __webpack_module_cache__ = {};
        
            // The require function
            function __webpack_require__(moduleId) {
              // Check if module is in cache
              var cachedModule = __webpack_module_cache__[moduleId];
              if (cachedModule !== undefined) {
                return cachedModule.exports;
              }
              // Create a new module (and put it into the cache)
              var module = (__webpack_module_cache__[moduleId] = {
                // no module.id needed
                // no module.loaded needed
                exports: {},
              });
        
              // Execute the module function
              __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
        
              // Return the exports of the module
              return module.exports;
            }
        
            var __webpack_exports__ = {};
            // This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
            (() => {
              ${_source}
            })();
          })();
        `
    }
}
