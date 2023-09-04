const {Schema, model} = require('mongoose')

const RoleSchema = new Schema({
    name: {
        type: String,
        required: [true, 'role name is required.'],
        unique: [true, 'role must be unique']
    },
    isEnabled: {
        type: Boolean,
        default: true
    }
})

module.exports = model('role', RoleSchema)