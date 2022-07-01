const express = require("express");
const cors = require('cors');

const app = express();

app.use(express.static(__dirname));

const router = express.Router();
app.use(router);

router.use(express.json());
app.use(cors());

const upload=require("../middleware/multer"); //file upload

// const Authorization = require('../middleware/autherization');

const corsOptions ={
    origin:'http://localhost:3000', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
};
app.use(cors(corsOptions));
app.options('*', cors());

const { 
    getUsersList,
    createNewUser,
    loginValidate

} = require('../controllers/userController');

const {uploadDoc,documentList,deleteDoc,deleteDocfromDB,downloadDoc}=require('../controllers/fileuploadController'); //fileupload 

router.get("/users/list", getUsersList);
router.post("/users/NewUser", createNewUser);
router.post("/users/login", loginValidate);

//
router.get("/file/list",documentList);
router.post("/file/upload",upload.fields([{ name: 'file', maxCount: 3 }]),uploadDoc);
router.put("/file/delete/:id",deleteDoc);
router.post("/file/delete/fromdb/:Id",deleteDocfromDB);
router.get("/file/download/:filename",downloadDoc);
//file upload

module.exports = router;

