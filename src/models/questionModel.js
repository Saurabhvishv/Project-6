const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({

    description: {
        type: String,
        required: true
        
    },
    tag: {
        type: Array,
        trim: true
    },
    

    askedBy: {
        type:mongoose.Schema.Types.ObjectId, //a referenec to user collection.
        ref:'ProductUser',
        required: true
    },
    deletedAt: {
        type: Date,//when the document is deleted
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
    
}, { timestamps: true })

module.exports = mongoose.model('Question', questionSchema, 'question')