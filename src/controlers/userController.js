const UserModel = require('../models/userModel.js')
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const mongoose = require("mongoose")


const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const validObject = function (value) {
    return mongoose.Types.ObjectId.isValid(value)
}

function phoneCheck(str) {
    if (/^(1\s|1|)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-|\s)?(\d{4})$/.test(str)) {
        return true
    }

}

const isValidPassword = function (value) {
    if (value.length > 7 && value.length < 16) { return true }
};



//Create User
const registerUser = async function (req, res) {
    try {
        const requestBody = req.body;

        // Extract params
        let { fname, lname,phone, email, password } = requestBody;

        if (!isValid(fname)) {
            return res.status(400).send({ status: false, message: 'first name is not valid' })

        }

        if (!isValid(lname)) {
            return res.status(400).send({ status: false, message: 'last name is not valid' })

        }

        if (!isValid(email)) {
            res.status(400).send({ status: false, message: 'email is required' })
            return
        }

        if (!isValid(password)) {
            res.status(400).send({ status: false, message: 'password is required' })
            return
        }

        if (!((password.length > 7) && (password.length < 16))) {

            return res.status(400).send({ status: false, message: `Password length should be between 8 and 15.` })

        }

        const isEmailAlreadyUsed = await UserModel.findOne({ email });
        if (isEmailAlreadyUsed) {
            res.status(400).send({ status: false, message: `${email} mail is already registered` })
            return
        }
        if (!isValid(email)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide valid email' })
            return
        }

        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim()))) {
            res.status(400).send({ status: false, message: `Email should be a valid email address` })
            return
        }
        //const validphone =  await (/^\d{10}$/.test(phone))
       
        const EncrypPassword = await bcrypt.hash(password, 10)
        // console.log(EncrypPassword)
        const userData = { fname, lname, phone, email, password: EncrypPassword }
        const newUser = await UserModel.create(userData);

        res.status(201).send({ status: true, message: `user created successfully`, data: newUser });
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })

    }
}

//login User

const login = async function (req, res) {
    try {

        const requestBody = req.body
        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'value in request body is required' })
            return
        }

        let email = req.body.email
        let password = req.body.password

        if (!isValid(email)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide valid email' })
            return
        }
        //  email = email.trim();

        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            res.status(400).send({ status: false, message: `Email should be a valid email address` })
            return
        }

        if (!isValid(password)) {
            res.status(400).send({ status: false, message: 'password must be present' })
            return
        }

        if (email && password) {
            let User = await UserModel.findOne({ email: email })
            if (!User) {
                return res.status(400).send({ status: false, msg: "email does not exist" })
            }
            let decryppasss = await bcrypt.compare(password, User.password);

            if (decryppasss) {
                const Token = jwt.sign({
                    userId: User._id,
                    iat: Math.floor(Date.now() / 1000), //issue date
                    exp: Math.floor(Date.now() / 1000) + 30 * 60
                }, "Group8") //exp date 30*60=30min
                // res.header('x-api-key', Token)

                res.status(200).send({ status: true, msg: "success", data: { userId: User._id, token: Token } })
            } else {
                res.status(400).send({ status: false, Msg: "Invalid password" })
            }
        }
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


//User Details

const GetUsers = async function (req, res) {
    try {
        //console.log(req.user)
        if (req.user.userId != req.params.userId) {
            return res.status(401).send({ status: false, msg: "userId does not match" })
        }
        let userId = req.params.userId
        console.log(userId)
        let findUserId = await UserModel.findOne({ _id: userId })
        if (findUserId) {
            res.status(200).send({ status: true, msg: "User Profile details", data: findUserId })
        }

    } catch (err) {
        res.staus(500).send({ status: false, msg: err.message })
    }
}


// Update Details
const updateUser = async function (req, res) {
    try {
        const userId = req.params.userId
        const requestBody = req.body
        if (!validObject(userId)) {
            res.status(400).send({ status: false, message: `${userId} is invalid` })
            return
        }
        const userFound = await UserModel.findOne({ _id: userId })
        if (!userFound) {
            res.status(401).send({ status: false, message: `User does not exist` })
        }
        // Authorisation

        if (userId.toString() !== req.params.userId) {
            res.status(401).send({ status: false, message: `user id doesn't match provide valid user id` })
            return
        }
        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: `write the user details which you want to update` })
            return
        }
        let { fname, lname, email, phone } = requestBody;
        let updateUser = {};
        if (isValid(fname)) {
            updateUser['fname'] = fname
        }
        if (isValid(lname)) {
            updateUser['lname'] = lname
        }
        if (isValid(email)) {
            if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim()))) {
                res.status(400).send({ status: false, message: `Email should be a valid email address` })
            }
            const duplicateEmail = await UserModel.find({ email: email })
            if (duplicateEmail.length) {
                res.status(400).send({ status: false, message: 'email already exists' })
            }
            updateUser['email'] = email
        }
        if (isValid(phone)) {
            if (!(/^(1\s|1|)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-|\s)?(\d{4})$/.test(phone.trim()))) {
                res.status(400).send({ status: false, message: `Please provide valid phone number` })
            }
            const duplicatePhone = await UserModel.find({ phone: phone })
            if (duplicatePhone.length) {
                res.status(400).send({ status: false, message: 'phone already exists' })
            }
            updateUser['phone'] = phone
        }
        const updatedUserData = await UserModel.findOneAndUpdate({ _id: userId }, updateUser, { new: true })
        res.status(201).send({ status: true, data: updatedUserData })
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
    }
}

module.exports.registerUser = registerUser;
module.exports.login = login;
module.exports.GetUsers = GetUsers
module.exports.updateUser = updateUser