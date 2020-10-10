const fs = require("fs")
const path = require("path")
const basePath = require('./path')

const deleteFile = (deleteFilePath) => {
    const finalPath = path.join(basePath, deleteFilePath)
    fs.unlink(finalPath, (err) => {
        if (err){
            throw (err)
        }
    })
}

exports.deleteFile = deleteFile