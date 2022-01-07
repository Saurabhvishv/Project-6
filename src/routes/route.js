const express = require('express');

const router = express.Router();

const usercontroller=require("../controlers/userController.js")
const questionController= require("../controlers/questionController.js")
const AnswerController= require("../controlers/answerController.js")
const Middleware = require("../middleware/Authentication")

//USER API
router.post('/User',usercontroller.registerUser)
router.post('/Login',usercontroller.login)
router.get('/User/:userId/profile',Middleware.Auth,usercontroller.GetUsers)
router.put('/User/:userId/profile',Middleware.Auth,usercontroller.updateUser)

//question APi

router.post('/question', Middleware.Auth,questionController.createQuestion)
router.get('/questions', questionController.getAllQuestion)
router.get('/questions/:questionId', questionController.getQuestionById)
router.put('/updateQuestionById/:questionId', Middleware.Auth,questionController.updateQuestionById)
router.delete('/deleteQuestions/:questionId',Middleware.Auth,questionController.deleteQuestions)

//answer API

router.post('/answer', Middleware.Auth,AnswerController.createAnswer)
router.get('/answerDetails/:questionId',AnswerController.getAllAnswers)
router.put('/answer/:answerId', Middleware.Auth, AnswerController.updateAnswer)
//router.delete('/answer/:answerId', auth.userAuth, answerController.delAns)
module.exports = router;