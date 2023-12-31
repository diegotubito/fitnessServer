const { Schema, model } = require('mongoose')
const {ImageModel} = require('../Image/image_model')

const PhoneSchema = new Schema({
    countryName: {
        type: String
    },
    number: {
        type: String
    },
    phoneCode: {
        type: String
    },
    countryCode: {
        type: String
    }
})

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
        type : String
    },
    lastName : {
        type : String 
    },
    profileImage : ImageModel,
    isEnabled: {
        type: Boolean,
        default: true
    },
    phone: {
        type: PhoneSchema
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    twoFactorEnabled: { 
        type: Boolean,
        default: false 
    },
    twoFactorSecret: { 
        type: String,
        default: ""
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