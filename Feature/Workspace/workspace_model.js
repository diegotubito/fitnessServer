const { Schema, model, SchemaTypes } = require('mongoose')

const Invitation = require('../../Feature/Invite/invite_model')

const locationSchema = new Schema({
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
}, {_id: false});

const geometrySchema = new Schema({
    location: locationSchema,
    location_type: { type: String, required: true }
}, {_id: false});

const addressComponentSchema = new Schema({
    long_name: { type: String, required: true },
    short_name: { type: String, required: true },
    types: [String],
}, {_id: false});

const plusCodeSchema = new Schema({
    compoundCode: String,
    globalCode: String,
}, {_id: false});

const GoogleGeocode = new Schema({
    address_components: [addressComponentSchema],
    formatted_address: { type: String, required: true },
    geometry: geometrySchema,
    place_id: { type: String, required: true },
    plus_code: plusCodeSchema,
    types: [String],
}, {_id: false});

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
    googleGeocode: {
        type: GoogleGeocode
    }
}, {_id: false});

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
    locationVerificationStatus: {
        type: String,
        enum: ["NOT_VERIFIED", "PENDING", "VERIFIED", "REJECTED"],
        default: "NOT_VERIFIED"
    },
    locationVerifiedDocuments: [String],
    logo: {
        type: String
    },
    images: [Schema.Types.Mixed],
}, { timestamps: true })

module.exports = model('workspace', WorkspaceSchema)