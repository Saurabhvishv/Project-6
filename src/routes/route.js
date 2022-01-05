const express = require('express');

const router = express.Router();

const usercontroller=require("../controlers/userController.js")
const Middleware = require("../middleware/Authentication")

//USER API
router.post('/User',usercontroller.registerUser)
router.post('/Login',usercontroller.login)
router.get('/User/:userId/profile',Middleware.Auth,usercontroller.GetUsers)
router.put('/User/:userId/profile',Middleware.Auth,usercontroller.updateUser)
module.exports = router;