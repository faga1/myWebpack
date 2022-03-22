module.exports = class plugin1{
    constructor(compiler){
        this.compiler = compiler;
    }
    apply(){
        this.compiler.hooks.run.tap('plugin1',()=>{console.log('plugin1')})
    }
}