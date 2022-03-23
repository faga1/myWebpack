
        (() => {
            var __webpack_modules__ = {
              
                  'E:/项目/myWebpack/example/src/module2.js': (module) => {
                    module.exports = {
    b:2
}completed by loader1
              }
                ,
                  'E:/项目/myWebpack/example/src/module1.js': (module) => {
                    const module2 = require('./module2.js')
module.exports = {a:1,...module2}completed by loader1
              }
                
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
              const obj = require('./module1.js');
function entry1(){
    console.log('entry1');
    console.log(obj.a);
}completed by loader1
            })();
          })();
        