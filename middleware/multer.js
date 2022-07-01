// const multer = require("multer");
// const path = require("path");
// // Multer config
// module.exports = multer({

//   storage: multer.diskStorage({}),
//   fileFilter: (req, file, cb) => {
//     // let ext = path.extname(file.originalname);
//     // if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
//     //   cb(new Error("Unsupported file type!"), false);
//     //   return;
//     // }
//     cb(null, true);
//   },
// });

const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');

const mongouri = 'mongodb+srv://mindmadetechnology:mindmade001@cluster0.2wo7w.mongodb.net/ReusableDB?authSource=admin&replicaSet=atlas-w4bhc7-shard-0&w=majority&readPreference=primary&retryWrites=true&ssl=true';

// Multer config
module.exports = multer({ 
   storage: GridFsStorage({
    url: mongouri,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
          const filename = file.originalname;
          const fileInfo = {
            filename: filename,
            bucketName: 'documents'
          };
          resolve(fileInfo);
      });
    }
  })
});
