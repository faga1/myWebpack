module.exports = function unixPath(path){
    return path.replace(/\\/g,'/')
}