const handleError = require('../../Common/error_response')
const Role = require('../Role/role_model')

const getRole = async (req, res) => {
    try {
        const roles = await Role.find()

        res.json({
            roles
        })
    } catch (error) {
        handleError(res, error)
    }
}

const createRole = async (req, res) => {
    const body = req.body
    if (!body) {
        return res.status(400).json({
            title: '_400_ERROR_TITLE',
            message: '_400_ERROR_MESSAGE'
        }) 
    }

    try {
        const potentialNewrole = Role(body)
        const newRole = await potentialNewrole.save()

        if (!newRole) {
            return res.status(400).json({
                title: '_400_ERROR_TITLE',
                message: '_400_ERROR_MESSAGE'
            }) 
        }
    
        res.json({
            role: newRole
        })
    } catch (error) {
        handleError(res, error)
    }
}

const deleteRole = async (req, res) => {
    const {_id} = req.query

    if (!_id) {
        return res.status(400).json({
            title: '_400_ERROR_TITLE',
            message: '_400_ERROR_MESSAGE'
        }) 
    }

    try {
        const deleted = await Role.findByIdAndRemove(_id)
        if (!deleted) {
            return res.status(400).json({
                title: '_400_ERROR_TITLE',
                message: '_400_ERROR_MESSAGE'
            }) 
        }

        res.json({
            role: deleted
        })
    } catch (error) {
        handleError(res, error)
    }
}

const deleteAllRole = async (req, res) => {
    try {
        await Role.deleteMany()
        res.json('roles deleted.')
    } catch (error) {
        handleError(res, error)
    }
}

const updateRole = async (req, res) => {
    const {_id} = req.query
    const {isEnabled, ...cleanBody} = req.body

    if (!cleanBody || !_id) {
        return res.status(400).json({
            title: '_400_ERROR_TITLE',
            message: '_400_ERROR_MESSAGE'
        }) 
    }

    const options = {
        new: true
    }

    try {
        const updated = await Role.findByIdAndUpdate(_id, cleanBody, options)

        if (!updated) {
            return res.status(400).json({
                title: '_400_ERROR_TITLE',
                message: '_400_ERROR_MESSAGE'
            }) 
        }

        res.json({
            role: updated
        })

    } catch (error) {
        handleError(res, error)
    }
}

module.exports = { getRole, createRole, deleteRole, updateRole, deleteAllRole }