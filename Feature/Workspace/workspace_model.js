const { Schema, model, SchemaTypes } = require('mongoose')

const Invitation = require('../../Feature/Invite/invite_model')

const PointSchema = new Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number],
        required: true,
        unique: [true, 'spot coordintates must be unique'],
    },
    street: {
        type: String,
        required: [true, 'Street is required'],
    },
    streetNumber: {
        type: Number,
        require: [true, 'Street number is required']
    },
    cp: {
        type: String,
    },
    locality: {
        type: String,
    },
    state: {
        type: String,
    },
    country: {
        type: String,
    }
});

const WorkspaceSchema = new Schema({
    title: {
        type: String,
        required: [true, 'workspace name is required']
    },
    subtitle: {
        type: String
    },
    isEnabled: {
        type: Boolean,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'owner is required']
    },
    members: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        role: {
            type: String,
            required: [true, 'role for memeber is required']
        }
    }],
    location: {
        type: PointSchema
    },
    logo: {
        type: String
    },
    images: [Schema.Types.Mixed]
}, { timestamps: true })

module.exports = model('workspace', WorkspaceSchema)