const { request, response } = require("express")
const Workspace = require('./workspace_model')
const handleError = require("../../Common/error_response")

const getWorkspace = async (req = request, res = response) => {
    try {
        const workspaces = await Workspace.find()

        res.json({
            workspaces
        })
    } catch (error) {
        handleError(res, error)
    }
}

const getWorkspaceByUserId = async (req = request, res = response) => {
    const { userId } = req.query
    if (!userId) {
        return res.status(400).json({
            title: '_400_ERROR_TITLE',
            message: '_400_ERROR_MESSAGE'
        })
    }

    try {
        const workspaces = await Workspace.find({
            $or: [
                { "owner": userId },
                { "members.user": userId }
            ]
        })
        .populate('members.user')

        if (!workspaces) {
            return res.status(400).json({
                title: '_400_ERROR_TITLE',
                message: '_400_ERROR_MESSAGE'
            })
        }

        res.json({
            workspaces
        })
    } catch (error) {
        handleError(res, error)
    }
}

const createWorkspace = async (req = request, res = response) => {
    const body = req.body
    if (!body) {
        return res.status(400).json({
            title: '_400_ERROR_TITLE',
            message: '_400_ERROR_MESSAGE'
        })
    }

    try {
        //here I've got to validate if the user exists and is enabled.
        //To Do

        const newWorkspace = Workspace(body)
        const saved = await newWorkspace.save()

        if (!saved) {
            return res.status(400).json({
                title: '_400_ERROR_TITLE',
                message: '_400_ERROR_MESSAGE'
            })
        }

        res.json({
            workspace: saved
        })
    } catch (error) {
        handleError(res, error)
    }
}

const updateWorkspace = async (req = request, res = response) => {
    const { _id } = req.query
    const { isEnabled, owner, members, locationVerificationStatus, ...filteredBody } = req.body

    if (!req.body || !_id) {
        return res.status(400).json({
            title: '_400_ERROR_TITLE',
            message: '_400_ERROR_MESSAGE'
        })
    }

    const options = {
        new: true
    }

    try {
        const updated = await Workspace.findByIdAndUpdate(_id, filteredBody, options)
        .populate('members.user')

        if (!updated) {
            return res.status(400).json({
                title: '_400_ERROR_TITLE',
                message: '_400_ERROR_MESSAGE'
            })
        }

        res.json({
            workspace: updated
        })
    } catch (error) {
        handleError(res, error)
    }
}

const updateAddress = async (req, res) => {
    const worskpaceId = req.query._id
    const {_id, title, subtitle, isEnabled, logo, images, owner, members, locationVerificationStatus , ...cleanBody} = req.body

    if (!worskpaceId) {
        return res.status(400).json({
            title: '_400_ERROR_TITLE',
            message: '_400_ERROR_MESSAGE'
        })
    }

    const updateBody = {
        locationVerificationStatus: "NOT_VERIFIED",
        location: cleanBody.location
    }

    const options = {
        new: true
    }

    try {
        const workspace = await Workspace.findByIdAndUpdate(worskpaceId, updateBody, options)

        res.json({
            workspace
        })
    } catch (error) {
        handleError(res, error)
    }
    
}

const verifyAddress = async (req, res) => {
    const worskpaceId = req.query._id
    const {locationVerificationStatus} = req.body

    if (!locationVerificationStatus || !worskpaceId) {
        return res.status(400).json({
            title: '_400_ERROR_TITLE',
            message: '_400_ERROR_MESSAGE'
        })
    }

    const updateBody = {
        locationVerificationStatus: locationVerificationStatus
    }

    const options = {
        new: true
    }

    try {
        const workspace = await Workspace.findByIdAndUpdate(worskpaceId, updateBody, options)

        res.json({
            workspace
        })
    } catch (error) {
        handleError(res, error)
    }
    
}

const deleteWorkspace = async (req = request, res = response) => {
    const _id = req.query._id

    if (!_id) {
        return res.status(400).json({
            title: '_400_ERROR_TITLE',
            message: '_400_ERROR_MESSAGE'
        })
    }

    try {
        const deleted = await Workspace.findByIdAndRemove(_id)

        if (!deleted) {
            return res.status(400).json({
                title: '_400_ERROR_TITLE',
                message: '_400_ERROR_MESSAGE'
            })
        }

        res.json({
            workspace: deleted
        })
    } catch (error) {
        handleError(res, error)
    }

}

const deleteWorkspaceMember = async (req, res) => {
    const {workspace, user} = req.body

    if (!workspace || !user) {
        return res.status(400).json({
            title: '_400_ERROR_TITLE',
            message: '_400_ERROR_MESSAGE'
        })
    }

    try {
        // Use the $pull operator to remove the member with the matching user ObjectId
        const updatedWorkspace = await Workspace.findByIdAndUpdate(workspace, {
            $pull: { members: { user } }
        }, { new: true });  // 'new: true' returns the modified document

        if (!updatedWorkspace) {
            return res.status(400).json({
                title: '_400_ERROR_TITLE',
                message: '_400_ERROR_MESSAGE'
            });
        }
        
        res.json({
            workspace: updatedWorkspace
        })

    } catch (error) {
        handleError(res, error)
    }
}

const deleteAllWorkspace = async (req = request, res = response) => {
    try {
        await Workspace.deleteMany()
        res.json('all workspaces were deleted.')
    } catch (error) {
        handleError(res, error)
    }
}

module.exports = {
    getWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    deleteAllWorkspace,
    getWorkspaceByUserId,
    updateAddress,
    verifyAddress,
    deleteWorkspaceMember
}