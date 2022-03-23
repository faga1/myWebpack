const module1 = require('./module1.js')
function entry2(){
    console.log(module1.a);
    console.log(entry2);
}