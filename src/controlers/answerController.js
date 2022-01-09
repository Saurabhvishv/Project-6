const mongoose = require('mongoose')
const jwt = require("jsonwebtoken")
const questionModel = require("../models/questionModel")
const answerModel = require('../models/answerModel.js')
const userModel = require("../models/userModel")

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

//Api 1 create answer
const createAnswer = async function (req, res) {
    try {
        const requestBody = req.body
        const userId = requestBody.answeredBy
        const quesId = req.body.questionId
        const userIdFromToken = req.user.userId
        const { answeredBy, questionId, text } = requestBody
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, Message: "Invalid request params, please provide question details" })
        }
        if (!(isValid(answeredBy))) {
            return res.status(400).send({ status: false, msg: "provide valid object Id for asked by" })
        }
        if (!(isValid(quesId))) {
            return res.status(400).send({ status: false, msg: "provide valid object Id for asked by" })
        }
        if (userIdFromToken != userId) {
            return res.status(401).send({ status: false, msg: "userId does not match by askedby given ID" })
        }
        if (userIdFromToken == quesId) {
            return res.status(401).send({ status: false, msg: "questionId does not match by askedby given ID" })
        }
        if (!isValidObjectId(answeredBy)) {
            return res.status(400).send({ status: false, Message: "Please provide vaild askedBy ID" })
        }
        if (!isValidObjectId(questionId)) {
            return res.status(400).send({ status: false, Message: "Please provide vaild askedBy ID" })
        }
        let checkUser = await userModel.findOne({ _id: userId })
        if (!checkUser) {
            return res.status(400).send({ status: false, msg: "The user for this ID does not exist" })
        }
        if (userIdFromToken == userId) {
            if (userIdFromToken !== quesId) {
                let userQuestion = await questionModel.findOne({ _id: questionId })
                if (!(userId == userQuestion.askedBy)) {
                    if (!isValid(text)) {
                        return res.status(400).send({ status: false, Message: "Please provide description" })
                    }
                    if (!isValid(questionId)) {
                        return res.status(400).send({ status: false, Message: "Please provide tags" })
                    }
                    if (!(isValid(answeredBy))) {
                        return res.status(400).send({ status: false, msg: "provide valid askedBy" })
                    }
                    await userModel.findOneAndUpdate({ _id: userId },{$inc:{creditScore: +200}}, { new: true })
                    let question = await answerModel.create(requestBody)
                    return res.status(200).send({ status: false, Message: "Question created successfully", data: question })
                } else { return res.status(401).send({ status: false, Message: "user not give answer to own question" }) }
            } else { return res.status(401).send({ status: false, Message: "Unauthorized attemped! can't post question using this ID" }) }
        } else {
            return res.status(401).send({ status: false, Message: "Unauthorized access attemped! can't post question using this ID" })
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

//API2 get answer details
const getAnswerById = async function (req, res) {
    try {
        const quesId = req.params.questionId
        if (!isValidObjectId(quesId)) {
            return res.status(400).send({ status: false, Message: "Please provide vaild question ID" })
        }
        const question = await answerModel.findOne({ _id: quesId, isDeleted: false })
        if (!question) {
            res.status(404).send({ status: false, Message: "No question found with provided Question ID" })
        }
        const answer = await questionModel.find({ questionId: quesId, isDeleted: false })
        if (answer.length == 0) {
            const AnswerData = "No answer is present"
            const questionList = question
            const data = { questionList, AnswerData }
            return res.status(200).send({ status: true, message: "questionlist ", data: data })
        }
        const AnswerData = answer
        const questionList = question
        const data = { questionList, AnswerData }
        return res.status(200).send({ status: true, message: "question answer  list", data: data })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

//Api 3 update answers
const updateAnswer = async function (req, res) {

    try {
        const _id = req.params.answerId
        const requestBody = req.body;
        const userIdFromToken = req.user.userId
        console.log(userIdFromToken)
        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: "Please provide valid data in request body" })
            return
        }
        if (!isValidObjectId(_id)) {
            return res.status(400).send({ status: false, Message: "Please provide valid answer id" })
        }
        if (!isValidObjectId(userIdFromToken)) {
            res.status(400).send({ status: false, message: `${userIdFromToken} is not a valid token id` })
            return
        }
        const answer = await answerModel.findOne({ _id })
        if (!(answer)) {
            return res.status(404).send({ status: false, msg: "No answer present" })
        } console.log(answer.answeredBy.toString())
        if (!(userIdFromToken == answer.answeredBy.toString())) {
            return res.status(401).send({ status: false, msg: `${userIdFromToken}You are  not authorized to update this question` })
        }
        let { text } = requestBody
        let updateData = {}
        if (!isValid(text)) {
            res.status(400).send({ status: false, message: "text should have some value" })
            return
        }
        updateData['text'] = text
        let UpdatedAnswer = await answerModel.findOneAndUpdate({ _id }, updateData, { new: true })
        return res.status(200).send({ status: true, Message: "Data saved Sucessfully", data: UpdatedAnswer })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

//API 4 delete the answer
const deleteAnswers = async function (req, res) {

    try {
        const answerId = req.params.answerId
        const userIdFromToken = req.user.userId
        if (!isValidObjectId(answerId)) {
            return res.status(400).send({ status: false, Message: "Please provide valid answer id" })
        }
        const answer = await answerModel.findOne({ _id: answerId, isDeleted: false })
        if (!(answer)) {
            return res.status(404).send({ status: false, msg: "No answer found with this Id" })
        }
        if (!(userIdFromToken == answer.answeredBy.toString())) {
            return res.status(401).send({ status: false, msg: "You are  not authorized to update this answer" })
        }
        const deletedData = await answerModel.findOneAndUpdate({ _id: answerId }, { isDeleted: true, deletedAt: new Date() }, { new: true })
        res.status(200).send({ status: true, msg: "Answer Deleted", data: deletedData })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

module.exports.createAnswer = createAnswer;
module.exports.getAnswerById = getAnswerById;
module.exports.updateAnswer = updateAnswer;
module.exports.deleteAnswers = deleteAnswers;