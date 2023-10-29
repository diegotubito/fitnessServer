const { Schema, model, SchemaTypes } = require('mongoose')

const SingleImageModel = new Schema({
    url: {
        type: String,
        required: [true, 'the image url is required']
    },
    size: {
        type: Number
    },
    fileType: {
        type: String
    },
    dimensions: {
        width: Number,
        height: Number
    }
}, {_id: false})

const ImageModel = new Schema({
    highResImage: SingleImageModel,
    thumbnailImage: SingleImageModel,
    creator: {
        type: Schema.Types.ObjectId,
        required: [true, 'image creator is required']
    }
}, {timestamps: true})

module.exports = { SingleImageModel, ImageModel }