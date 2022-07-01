const fileModel = require('../models/fileuploadModel');
const mongoose = require("mongoose");
var fs = require('fs');

const url = process.env.DB_CONNECT;
const connect = mongoose.createConnection(url, { useNewUrlParser: true, useUnifiedTopology: true });
let gridFS;
connect.once('open', () => {
    gridFS = new mongoose.mongo.GridFSBucket(connect.db, {
        bucketName: "documents"
    });
}); //doc using gridfs


const documentList = (req, res) => {
    fileModel.find({Isdeleted:'n'}, function (err, result) {
        if (err) {
            res.send({ statusCode: 400, message: "There was a problem adding the information to the database." });
        } else {
            if (result.length === 0) {
                res.send({ message: "No Records Found" })
            } else {
                res.send(result);
            }
        }
    });
} //get doc list

const uploadDoc = (req, res) => {
    const name = req.body.name;
    const filedata = req.files.file;
    try {
        if (req.files.file.filename === undefined) {
            const usersave = new fileModel({
                name: name,
                file: filedata
            });
            usersave.save(function (err, result) {
                if (err) {
                    console.log(err);
                    res.send({ statusCode: 400, message: "Failed to upload file" });
                } else if (result.length === 0) {
                    res.send({ statusCode: 400, message: "Please Select a File" });
                }
                else {
                    res.send({ statusCode: 200, message: "Document upload Successfully" });
                }
            });
        }
        else {
            res.send({ statusCode: 400, message: "Failed to upload...." });
        }
    } catch (err) {
        res.send({statusCode: 400, message:err})  
    }
} //upload doc


const deleteDoc = (req, res) => {
    const id = req.params.id;
    const Isdeleted = "y";
    try {
        fileModel.findById({ _id: id }, function (err, result) {
            if (err) {
                res.send({ statusCode: 400, message: "Failed" });
            } else {
                fileModel.findOneAndUpdate({ _id: id },
                    {
                        $set: {
                            Isdeleted: Isdeleted
                        }
                    }, function (err, result) {
                        if (err) {
                            res.send({ statusCode: 400, message: "Failed" });
                        } else {
                            res.send({ statusCode: 200, message: "Deleted Successfully" });
                        }
                    });
            }
        });
    } catch (err) {
        res.send({statusCode: 400, message:err})  
    }
} //delete doc from json

const deleteDocfromDB = (req, res) => {
    try {
        const Id = req.params.Id;
        const fileId = req.body.fileId;
        fileModel.findById({_id:Id}, function (err, result) {
            if (err) {
                res.send(err);
            } else {
                let fileList = result.file;
                    let document = fileList;

              let filteredFile = document.filter(function (value) {
                return value.id != fileId;
              });
              fileModel.findOneAndUpdate({_id:Id},
                        {
                            $set:{
                                file:filteredFile
                            }
                        },function(err, result){
                            if(err){
                                res.send({message:err});
                            }else{
                              gridFS.delete(new mongoose.Types.ObjectId(req.body.fileId), (err, data) => {
                                   if (err) {
                                    return res.send({statusCode:404,message:'Error Occured'});
                                    }else{
                                        res.send({ statusCode:200,  message: `File successfully deleted`, });
                                    }
                                }); //delete file from gridfs 
                            }
                    })
            }
        });
    } catch (err) {
        console.log(err);
        res.send({statusCode: 400, message:err})  
  }
} //delete doc from db

const downloadDoc = (req, res) => {
    try {
        const filename = req.params.filename;

        gridFS.openDownloadStreamByName(filename).
            pipe(fs.createWriteStream('../../' + filename)).
            on('error', function (error) {
                console.log("error" + error);
                res.send({ msg: error.message });
            }).on('finish', function () {
                res.send({ statusCode: 200, message: 'Downloaded successfully!' })
            });

    } catch (err) {
        res.send({ statusCode: 400, message: 'Catch error Occured' });
    }
} //doc download 

module.exports = { uploadDoc, documentList, deleteDoc, deleteDocfromDB, downloadDoc }

