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
        type:mongoose.Schema.Types.ObjectId,
        ref:'ProductUser',
        required: true
    },
    deletedAt: {
        type: Date,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
    
}, { timestamps: true })

module.exports = mongoose.model('Question', questionSchema)