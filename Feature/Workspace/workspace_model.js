const { Schema, model, SchemaTypes } = require('mongoose')

const Invitation = require('../../Feature/Invite/invite_model')
const {ImageModel} = require('../Image/image_model')

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
        enum: ['Point']
    },
    coordinates: {
        type: [Number],
        required: true
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
            enum: ['ADMIN_ROLE', 'USER_ROLE', 'USER_READ_ONLY_ROLE'],
            required: [true, 'role for memeber is required']
        },
        host: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        createdAt: {
            type: Date,
            default: Date.now()
        }
    }],
    location: {
        type: PointSchema
    },
    locationVerificationStatus: {
        type: String,
        enum: ["ADDRESS_NOT_VERIFIED", "ADDRESS_PENDING", "ADDRESS_VERIFIED", "ADDRESS_REJECTED"],
        default: "ADDRESS_NOT_VERIFIED"
    },
    documentImages: [ImageModel],
    defaultImage: ImageModel,
    defaultBackgroundImage: ImageModel,
    images: [ImageModel],
}, { timestamps: true })

module.exports = model('workspace', WorkspaceSchema)