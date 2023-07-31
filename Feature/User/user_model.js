const { Schema, model } = require('mongoose')

const UserSchema = new Schema({
    username: {
        type: String,
        unique: [true, 'username must be unique'],
        required: [true, 'username field is required']
    },
    email: {
        type: String,
        unique: [true, 'email must be unique'],
        required: [true, 'email field is required']
    },
    password: {
        type: String,
        require: [true, 'password field is required']
    },
    firstName : {
        type : String, 
        required : [true, 'firstName field is required.']
    },
    lastName : {
        type : String, 
        required : [true, 'lastname field is required.']
    },
    thumbnailImage : {
        type : String
    },
    isEnabled: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        required: [true, 'User role is required']
    },
    phoneNumber : {
        type: String
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    deviceTokens: [{
        type: String
    }]

}, {timestamps: true})

UserSchema.methods.toJSON = function() {
    const { __v, password, ...cleanUser } = this.toObject()
    return cleanUser
}

module.exports = model('user', UserSchema)