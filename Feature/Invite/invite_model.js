const { Schema, model } = require('mongoose')

const InvitationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'user id is needed']
    },
    workspace: {
        type: Schema.Types.ObjectId,
        ref: 'workspace',
        required: [true, 'workspace id is required.']
    },
    role: {
        type: String,
        required: [true, 'role is required for invitation']
    },
    status: {
        type: String,
        enum: ['INVITATION_PENDING', 'INVITATION_ACCEPTED', 'INVITATION_REJECTED'],
        default: 'INVITATION_PENDING'
    },
    expiration: {
        type: Date,
        default: () => {
            const date = new Date()
            date.setDate(date.getDate() + 2)
            return date;
        }
    }
})

module.exports = model('invitation', InvitationSchema)