const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    fname: {
        type: String,
        required: true,
        trim: true
    },
    lname: {
        type: String,
        required: true,
        trim: true
    },
    

    email: {
        type: String,
        trim: true,
        required : true,
        lowercase: true,
        unique: true
        
    },
    phone: {
        type: String,
        unique: true,
        index:  true,
        sparse: true
    },
    password: {
        type: String,
        trim: true,
        required: true// encrypted password
    },
    creditScore: {
        type:Number, 
        required: true
    }
    
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)