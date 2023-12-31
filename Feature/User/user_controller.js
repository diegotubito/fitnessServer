const User = require('./user_model')
const Phone = require('./user_model')
const handleError = require('../../Common/error_response')
const bcrypt = require('bcrypt')
const { request } = require('express')
const { emit } = require('../../Socket/socket_helper')

const getUsers = async (req = request, res) => {
    try {
        const users = await User.find()
        res.json({ users })
    } catch (error) {
        handleError(res, error)
    }
}

const getUsersByUserNameOrEmail = async (req = request, res) => {
    try {
        const { username } = req.query

        if (!username) {
            return res.status(400).json({
                title: '_400_ERROR_TITLE',
                message: '_400_ERROR_MESSAGE'
            })
        }

        const query = {
            $or: [
                { email: username },
                { username: username }
            ]
        }

        const users = await User.find(query)
        res.json({ users })
    } catch (error) {
        handleError(res, error)
    }
}

const createUser = async (req, res) => {
    if (!req.body.email || !req.body.username || !req.body.password) {
        return res.status(400).json({
            title: '_400_ERROR_TITLE',
            message: '_400_ERROR_MESSAGE'
        })
    }
    try {
        const body = req.body
        const salt = bcrypt.genSaltSync(10)
        const hashPassword = bcrypt.hashSync(body.password, salt)
        body.password = hashPassword
        const newUser = await User(body)
        const user = await newUser.save()
        res.json({
            user
        })
    } catch (error) {
        handleError(res, error)
    }
}

const deleteUser = async (req, res) => {
    const _id = req.query._id
    try {
        const user = await User.findByIdAndDelete(_id)

        if (!user) {
            return res.status(400).json({
                message: 'user not found'
            })
        }

        res.json({
            user
        })
    } catch (error) {
        handleError(res, error)
    }
}

const deleteAllUser = async (req, res) => {
   
    try {
        const user = await User.deleteMany()

        res.json('success')
    } catch (error) {
        handleError(res, error)
    }
}

const updateUser = async (req, res) => {
    const id = req.query._id
    const { password, _id, email, role, createdAt, updatedAt, emailVerified, ...cleanBody } = req.body

    const options = {
        new: true
    }

    try {
        const user = await User.findByIdAndUpdate(id, cleanBody, options)
        if (!user) {
            return res.status(400).json({
                message: 'user not found'
            })
        }
        if (req.body.phone) {
            user.phone = req.body.phone
            await user.save()
        }

        emit(req, [user.deviceTokens], 'new-message', {
            title: 'testing abc',
            message: 'ABC',
            action: 'needUpdate'
        })

        res.json({
            user
        })
    } catch (error) {
        handleError(res, error.message)
    }
}

const setProfileImage = async (req, res) => {
    const {_id, documentId, creator, highResImage, thumbnailImage} = req.body

    if (!_id || !documentId || !creator) {
        return res.status(400).json({
            title: '_400_ERROR_TITLE',
            message: '_400_ERROR_MESSAGE'
        })
    }

   try {
        const user = await User.findById(_id)

        if (!user) {
            return res.status(400).json({
                title: '_400_ERROR_TITLE',
                message: '_400_ERROR_MESSAGE'
            })
        }

        const newImage = {
            _id: documentId,
            highResImage: highResImage,
            thumbnailImage: thumbnailImage,
            creator
        }

        user.profileImage = newImage
        await user.save();

        res.json({
            user
        })
   } catch (error) {
        handleError(res, error)
   }
}

const disableUser = async (req, res) => {
    const id = req.query._id

    const options = {
        new: true
    }

    try {
        const user = await User.findByIdAndUpdate(id, { isEnabled: false }, options)

        if (!user) {
            return res.status(400).json({
                message: 'user not found'
            })
        }

        res.json({
            user
        })
    } catch (error) {
        handleError(res, error)
    }
}

const enableUser = async (req, res) => {
    const id = req.query._id

    const options = {
        new: true
    }

    try {
        const user = await User.findByIdAndUpdate(id, { isEnabled: true }, options)

        if (!user) {
            return res.status(400).json({
                message: 'user not found'
            })
        }

        res.json({
            user
        })
    } catch (error) {
        handleError(res, error)
    }
}

module.exports = { getUsers,
     createUser,
      deleteUser,
       updateUser,
        disableUser,
         enableUser,
          getUsersByUserNameOrEmail,
           deleteAllUser, 
           setProfileImage }