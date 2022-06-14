const JWT = require('jsonwebtoken');
const moment = require('moment-timezone');
const userModel = require("../models/userModel");
require('dotenv').config();


//getUsersList
const getUsersList = (req, res) => {
    userModel.find({ IsDeleted: 'n' }, function (err, result) {
        if (err) {
            res.send({ statusCode: 400, message: "Failed" });
        } else {
            if (result.length === 0) {
                res.send({ message: "No Records Found" })
            } else {
                res.send(result);
            }
        }
    });
};

//create new user
const createNewUser = (req, res) => {
    const Email = req.body.Email;
    const Password = req.body.Password;
    const Name = req.body.Name;
    const DateOfBirth = req.body.DateOfBirth;
    const Address = req.body.Address;
    const MobileNumber = req.body.MobileNumber;
    const Created_On = moment().tz('Asia/Kolkata').format("DD-MM-YYYY hh:mm A");
    try {
        if (Email === undefined || Password === undefined || Name === undefined || DateOfBirth === undefined ||
            Address === undefined || MobileNumber === undefined) {
            res.send({ statusCode: 400, message: "*required" })
        } else {
            userModel.findOne({ Email: Email }, function (err, result) {
                if (err) {
                    res.send({ stausCode: 400, message: "Failed" })
                } else if (result === null) {
                    const createNewUser = new userModel({
                        Email: Email,
                        Password: Password,
                        Name: Name,
                        DateOfBirth: DateOfBirth,
                        Address: Address,
                        MobileNumber: MobileNumber,
                        Created_On: Created_On
                    })
                    createNewUser.save(function (err, result) {
                        if (err) {
                            res.send({ statusCode: 400, message: "Failed" })
                        } else {
                            res.send({ statusCode: 200, message: "Registered Successfully" })
                        }
                    })
                }
                else {
                    res.send({ statusCode: 400, message: "Email Already Exist" })
                }
            })
        }
    }
    catch {
        res.send({ statusCode: 400, message: "Failed" });
    }
}

//login Validate
const loginValidate = (req, res) => {
    const Email = req.body.Email;
    const Password = req.body.Password;
    try {
            userModel.findOne({ Email: Email, Password: Password }, function (err, result) {
                if (err) {
                    res.send({ statusCode: 400, message: "Failed" })
                } else if (result === null) {
                    res.send({ statusCode: 400, message: "Invalid Email or Password" })
                }
                else {
                    const token = JWT.sign({
                        id: result._id
                    }, process.env.JWT_SECRET, { expiresIn: 60 * 60 * 96 });
                    res.send({ statusCode: 200, message: "Login Succeed", token: token });
                }
            })
        
    } catch {
        res.send({ statusCode: 400, message: "Failed" })
    }
}
module.exports = {
    getUsersList,
    createNewUser,
    loginValidate
}
