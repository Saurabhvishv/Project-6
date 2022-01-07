const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const questionModel = require("../models/questionModel")
const answerModel = require('../models/answerModel.js')
const userModel = require("../models/userModel")


const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length !== 0

}
// const tags = function (value) {
//     return [sci - fi, technology, coding, adventure].indexOf(value)
// }
// create question API
const createQuestion = async function (req, res) {
    try {
        const requestBody = req.body
        const userIdFromToken = req.userId


        const { askedBy, description, tag } = requestBody

        if (!(isValid(askedBy))) {
            return res.status(400).send({ status: false, msg: "provide valid object Id for asked by" })
        }
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, Message: "Invalid request params, please provide question details" })
        }

        if (req.user.userId != askedBy) {
            return res.status(401).send({ status: false, msg: "userId does not match" })
        }
        if (!isValidObjectId(askedBy)) {
            return res.status(400).send({ status: false, Message: "Please provide vaild askedBy ID" })
        }
        let checkUser = await userModel.findOne({ _id: askedBy })
        if (!checkUser) {
            return res.status(400).send({ status: false, msg: "The user does not exist" })
        }

        if (userIdFromToken !== askedBy) {
            if (!isValid(description)) {
                return res.status(400).send({ status: false, Message: "Please provide description" })
            }
            if (!isValid(tag)) {
                return res.status(400).send({ status: false, Message: "Please provide description" })
            }
            if (!(isValid(askedBy))) {
                return res.status(400).send({ status: false, msg: "provide valid askedBy" })
            }
            let question = await questionModel.create(requestBody)
            return res.status(200).send({ status: false, Message: "Question created successfully", data: question })
        } else {
            return res.status(401).send({ status: false, Message: "Unauthorized access attemped! can't post question using this ID" })
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });

    }
}


//Get question details API 2

const getAllQuestion = async function (req, res) {
    try {

        let filterQuery = { isDeleted: false, deletedAt: null }
        let queryParams = req.query;
        //extract Params
        const { sort, tag } = queryParams
        if (!isValid(tag)) {
            return res.status(400).send({ status: false, Message: "Please provide tag" })
        }

        if (isValid(sort)) {
            if (sort == "ascending") {
                var data = await questionModel.find(filterQuery).sort({ createdAt: 1 })
            }
            if (sort == "descending") {
                var data = await questionModel.find(filterQuery).sort({ createdAt: -1 });
            }
        } else {
            var data = await questionModel.find(filterQuery);
        }
        return res.status(200).send({ status: true, Message: "Question List", data: data })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

//API3 get details by questionId

const getQuestionById = async function (req, res) {
    try {
        const questionId = req.params.questionId

        if (!isValidObjectId(questionId)) {
            return res.status(400).send({ status: false, Message: "Please provide vaild askedBy ID" })
        }
        const question = await questionModel.findOne({ _id: questionId })

        if (!question) {
            res.status(404).send({ status: false, Message: "No question found with provided ID" })
        }

        const questionDetails = await answerModel.find({ questionId: questionId, isDeleted: false })
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


//updatequestion byId

const updateQuestionById = async function (req, res) {
    try {
        const questionId = req.params.questionId
        const requestBody = req.body;
        const userIdFromToken = req.userId

        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: "Please provide valid data in request body" })
            return
        }
        if (!isValidObjectId(questionId)) {
            return res.status(400).send({ status: false, Message: "Please provide valid question id" })
        }
        const question = await questionModel.findOne({ _id: questionId, isDeleted: false })
        if (!(question)) {
            return res.status(404).send({ status: false, msg: "No question present" })
        }
        // if (!(question.askedBy.toString() == userIdFromToken)) {
        //     return res.status(401).send({ status: false, msg: "You are  not authorized to update this question" })
        // }
        let { description, tag } = requestBody
        let updateData = {}
        //tag = String.prototype.trim.call(tag)
        if (isValid(tag)) {
            res.status(400).send({ status: false, message: "tag should have some value" })
            return
        }
        //tag = tag.trim()
        updateData['tag'] = tag

        if (!isValid(description)) {
            res.status(400).send({ status: false, message: "description should have some value" })
            return
        }
        //description = description.trim()
        updateData['description'] = description

        const updatedData = await question.save()
        return res.status(200).send({ status: true, Message: "Data saved Sucessfully", data: updatedData })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

//API 5 delete question

const deleteQuestions = async function(req, res) {
    try {
        const questionId = req.params.questionId
        const userIdFromToken = req.userId
        if (!isValidObjectId(questionId)) {
            return res.status(400).send({ status: false, Message: "Please provide valid question id" })
        }
        const question = await questionModel.findOne({ _id: questionId, isDeleted: false })
        if (!(question)) {
            return res.status(404).send({ status: false, msg: "No question found with this Id" })
        }
        // if (!(userIdFromToken == question.askedBy.toString())) {
        //     return res.status(401).send({ status: false, msg: "You are  not authorized to update this question" })
        // }
        const deletedData = await questionModel.findOneAndUpdate({ _id: questionId }, { isDeleted: true, deletedAt: new Date() }, { new: true })
        res.status(200).send({ status: true, msg: "Question Deleted", data: deletedData })

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}
module.exports.createQuestion = createQuestion;
module.exports.getAllQuestion = getAllQuestion;
module.exports.getQuestionById = getQuestionById;
module.exports.updateQuestionById = updateQuestionById;
module.exports.deleteQuestions = deleteQuestions;