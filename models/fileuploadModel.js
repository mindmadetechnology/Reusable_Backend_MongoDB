const mongoose = require("mongoose");

const FileUpload = new mongoose.Schema({
    file: [{
        data:Buffer,
        type:Object,
    }],
    Isdeleted:{
        type:String,
        default:'n'
    }
})
const uploadFile = 'files';

module.exports = mongoose.model('files', FileUpload, uploadFile);
