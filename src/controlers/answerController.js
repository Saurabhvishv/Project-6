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
        const userIdFromToken = req.userId
        const questionIdFromToken = req.questionId

        const { answeredBy, questionId, text } = requestBody

        if (!(isValid(answeredBy))) {
            return res.status(400).send({ status: false, msg: "provide valid object Id" })
        }
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, Message: "Invalid request params, please provide question details" })
        }

        if (req.user.userId != answeredBy) {
            return res.status(401).send({ status: false, msg: "userId does not match" })
        }
        if (!isValidObjectId(answeredBy)) {
            return res.status(400).send({ status: false, Message: "Please provide vaild askedBy ID" })
        }
        let checkUser = await userModel.findOne({ _id: answeredBy })
        if (!checkUser) {
            return res.status(400).send({ status: false, msg: "The user does not exist" })
        }
        if (userIdFromToken !== answeredBy) {
            if (!isValid(answeredBy)) {
                return res.status(400).send({ status: false, Message: "Please provide description" })
            }
            if (!isValid(questionId)) {
                return res.status(400).send({ status: false, Message: "Please provide description" })
            }
            if (!(isValid(text))) {
                return res.status(400).send({ status: false, msg: "provide valid askedBy" })
            }
            let question = await answerModel.create(requestBody)
            return res.status(200).send({ status: false, Message: "Question created successfully", data: question })
        } else {
            return res.status(401).send({ status: false, Message: "Unauthorized access attemped! can't post question using this ID" })
        }
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

//get answers by question id API

const getAllAnswers = async function (req, res) {
    try {
        const questionId = req.params.questionId
        let filterQuery = { isDeleted: false, deletedAt: null }

        if (questionId) {
            filterQuery["questionId"] = questionId
        }
        if (!isValidObjectId(questionId)) {
            return res.status(400).send({ status: false, Message: "Please provide vaild askedBy ID" })
        }
        const questionDetails = await questionModel.findOne({ questionId: questionId, isDeleted: false })

        if (!questionDetails) {
            res.status(404).send({ status: false, Message: "No question found with provided ID" })
        }

        const answerDetails = await answerModel.find({ questionId: questionId, isDeleted: false })
        const { description, tag, deletedAt, isDeleted, updatedAt, createdAt } = answerDetails
        const answerData = await answerModel.find({ _Id: questionId, isDeleted: false })
        //const answer = {description,tag , deletedAt, isDeleted, updatedAt, createdAt ,answerData: answerData}
        return res.status(200).send({ status: true, message: 'Answer list', data: answerData })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

//Api3 update answers

const updateAnswer = async function(req, res) {

    try {
        const requestBody = req.body
        const answerId = req.params.answerId
        const text = req.body.text
        const tokenId = req.userId
        if (!isValidObjectId(ansId)) {
            return res.status(400).send({ status: false, Message: "Please provide vaild answer ID" })
        }

        if (!isValidRequestBody(requestBody)) {
            return res.status(200).send({ status: false, Message: "No data updated, details are changed" })
        }

        const answer = await answerModel.findOne({ _id: answerId }, { isDeleted: false })

        if (!answer) {
            return res.status(404).send({ status: true, Message: "No answers found for this ID" })
        }

        if (!(answer.answeredBy == tokenId)) {
            return res.status(401).send({ status: false, Message: "Unauthorized, You can't update this answer " })
        }


        if (!isValid(text)) {
            return res.status(400).send({ status: false, Message: "Please provide text" })
        }
        answer['text'] = text

        const updatedAns = await answer.save()
        return res.status(200).send({ status: false, Message: "Answer updated successfully", data: updatedAns })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

//API 4 deleted answer

const delAns = async function(req, res) {

    try {
        const requestBody = req.body
        const answerId = req.params.answerId
        const tokenId = req.userId
        const userId = req.body.userId
        const questionId = req.body.questionId

        if (!isValidObjectId(answerId)) {
            return res.status(400).send({ status: false, Message: "Please provide vaild answer ID" })
        }

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, Message: "Please provide body" })
        }

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, Message: "Please provide vaild userId" })
        }

        if (!isValidObjectId(questionId)) {
            return res.status(400).send({ status: false, Message: "Please provide vaild questionId" })
        }

        if (!isValid(questionId)) {
            return res.status(400).send({ status: false, Message: "Please provide questionId" })
        }

        if (!isValid(userId)) {
            return res.status(400).send({ status: false, Message: "Please provide userId" })
        }


        const answer = await answerModel.findOne({ _id: ansId, isDeleted: false })
        console.log(answer)

        if (!answer) {
            return res.status(404).send({ status: true, Message: "No answers found for this ID" })
        }

        if (!(questionId == answer.questionId)) {
            return res.status(400).send({ status: false, Message: "Provided answer is not of the provided question" })
        }


        if (!(userId == tokenId)) {
            return res.status(401).send({ status: false, Message: "Unauthorized, You can't update this answer " })
        }

        const deletedAns = await answerModel.findOneAndUpdate({ _id: ansId }, { isDeleted: true, deletedAt: new Date() }, { new: true })
        return res.status(200).send({ status: true, msg: "Answer Deleted", data: deletedAns })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

module.exports.createAnswer = createAnswer;
module.exports.getAllAnswers = getAllAnswers;
module.exports.updateAnswer = updateAnswer;