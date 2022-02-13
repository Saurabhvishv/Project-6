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
const createAnswer = async function(req, res) {
    try {
        const userId = req.body.answeredBy
        const questionId = req.body.questionId
        const tokenId = req.user.userId
        const requestBody = req.body

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please provide data for successful Answer create for Particular Question" });
        }
        if (!isValid(userId)) {
            return res.status(400).send({ status: false, message: "Please provide answeredBy or answeredBy field" });
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "answeredBy UserId is not valid" })
        }
        if (!isValid(questionId)) {
            return res.status(400).send({ status: false, message: "Please provide QuestionId or QuestionId field" });
        }
        if (!isValidObjectId(questionId)) {
            return res.status(404).send({ status: false, message: "questionId is not valid" })
        }
        if (!(userId == tokenId)) {
            return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
        }
        const user = await userModel.findById(userId)
        if (!user) {
            res.status(404).send({ status: false, msg: "AnswerBy User Id not found in DB" })
        }
        const questiondetail = await questionModel.findOne({ _id: questionId, isDeleted: false })
        if (!questiondetail) {
            return res.status(400).send({ status: false, message: "question don't exist or it's deleted" })
        }
        let { text } = requestBody
        if (!isValid(text)) {
            return res.status(400).send({ status: false, message: "Please provide text detail to create answer " });
        }
        let userScoredata = await questionModel.findOne({ _id: questionId })
        if (!(req.body.answeredBy == userScoredata.askedBy)) {
            let increaseScore = await userModel.findOneAndUpdate({ _id: userId }, { $inc: { creditScore: +200 } })
            const data = { answeredBy: userId, text, questionId }
            const answerData = await answerModel.create(data);
            let totalData = { answerData, increaseScore }
            return res.status(200).send({ status: false, message: "User Credit Score updated ", data: totalData });
        } else {
            return res.status(400).send({ status: true, message: 'Sorry , You cannot Answer Your Own Question' });
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, msg: err.message });
    }
}

//API2 get answer details
const getAnswerById = async function(req, res) {
    try {
        const qId = req.params.questionId;
        if (!isValidObjectId(qId)) {
            return res.status(400).send({ status: false, Message: "Please provide vaild question ID" })
        }
        const question = await questionModel.findOne({ _id: qId, isDeleted: false })

        if (!question) {
            return res.status(404).send({ status: false, Message: "No question found with provided ID" })
        }
        const answer = await answerModel.find({ questionId: qId, isDeleted: false }).select({ answerdBy: 1, questionId: 1, text: 1 })

        if (answer.length == 0) {
            return res.status(404).send({ status: true, Message: "No answers found for this question" })
        }
        var ansArr = {
            description: question.description,
            tag: question.tag,
            askedBy: question.askedBy,
            answers: answer
        }
        return res.status(200).send({ status: true, data: ansArr })
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