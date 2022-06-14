const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    
    Email: {
        type: String,
    },
    Name : {
        type : String,
    },
    Password : {
        type : String,
    },
   DateOfBirth :{
       type:String
   },
   Address:{
       type:String
   },
   MobileNumber:{
       type:String
   },
   IsDeleted:{
        type:String,
        default:"n"
   },
   Created_On : {
        type : String,
    }
    
});

const collectionName = 'Users';

module.exports = mongoose.model('Users',UserSchema,collectionName);