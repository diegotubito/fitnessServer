const User = require('./user_model')
const handleError = require('../../Common/error_response')
const bcrypt = require('bcrypt')
const { request } = require('express')

const getUsers = async (req = request, res) => {
    try {
        const users = await User.find()
        res.json({ users })
    } catch (error) {
        handleError(res, error)
    }
}

const createUser = async (req, res) => {
    if (!req.body.email || !req.body.username || !req.body.password || !req.body.role) {
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

const updateUser = async (req, res) => {
    const id = req.query._id
    const {password, _id, email, role, createdAt, updatedAt, emailVerified, ...cleanBody} = req.body

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

        res.json( {
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
        const user = await User.findByIdAndUpdate(id, {isEnabled: false}, options)

        if (!user) {
            return res.status(400).json({
                message: 'user not found'
            })
        }

        res.json( {
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
        const user = await User.findByIdAndUpdate(id, {isEnabled: true}, options)

        if (!user) {
            return res.status(400).json({
                message: 'user not found'
            })
        }

        res.json( {
            user
        })
    } catch (error) {
        handleError(res, error)
    }
}

module.exports = { getUsers, createUser, deleteUser, updateUser, disableUser, enableUser }