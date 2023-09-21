const handleError = require("../../Common/error_response")
const Invitation = require('./invite_model')
const Workspace = require('../Workspace/workspace_model')
const { isMemberInWorkspace } = require("../../Common/common_functions")

const getAllInvitation = async (req, res) => {
    try {
        const invitations = await Invitation.find().populate('workspace')

        res.json({
            invitations
        })
    } catch (error) {
        handleError(res, error)
    }
}

const getInvitationByUserId = async (req, res) => {
    const { userId } = req.query

    if (!userId) {
        return res.status(400).json({
            title: '_400_ERROR_TITLE',
            message: '_400_ERROR_MESSAGE'
        })
    }

    try {
        const invitations = await Invitation.find({ user: userId })
        .populate({
            path: 'workspace',
            populate: {
                path: 'members.user'
            }
        })
        .populate('user')

        if (!invitations) {
            return res.status(400).json({
                title: '_400_ERROR_TITLE',
                message: '_400_ERROR_MESSAGE'
            })
        }

        res.json({
            invitations
        })

    } catch (error) {
        handleError(res, error)
    }
}

const getInvitationByWorkspaceId = async (req, res) => {
    const { workspaceId } = req.query

    if (!workspaceId) {
        return res.status(400).json({
            title: '_400_ERROR_TITLE',
            message: '_400_ERROR_MESSAGE'
        })
    }

    try {
        const invitations = await Invitation.find({ workspace: workspaceId })
            .populate({
                path: 'workspace',
                populate: {
                    path: 'members.user'
                }
            })
            .populate('user')

        if (!invitations) {
            return res.status(400).json({
                title: '_400_ERROR_TITLE',
                message: '_400_ERROR_MESSAGE'
            })
        }

        res.json({
            invitations
        })

    } catch (error) {
        handleError(res, error)
    }
}

const doInvite = async (req, res) => {
    const body = req.body

    if (!body) {
        return res.status(400).json({
            title: '_400_ERROR_TITLE',
            message: '_400_ERROR_MESSAGE'
        })
    }

    try {
        const newInvite = Invitation(body)
        const invite = await newInvite.save()

        if (!invite) {
            return res.status(400).json({
                title: '_400_ERROR_TITLE',
                message: '_400_ERROR_MESSAGE'
            })
        }

        // Populate the 'user' field
        const populatedInvite = await Invitation.findById(invite._id).populate({
            path: 'workspace',
            populate: {
                path: 'members.user'
            }
        })
            .populate('user')

        res.json({
            invitation: populatedInvite
        })

    } catch (error) {
        handleError(res, error)
    }
}

const doReject = async (req, res) => {
    const { invitationId } = req.query

    if (!invitationId) {
        return res.status(400).json({
            title: '_400_ERROR_TITLE',
            message: '_400_ERROR_MESSAGE'
        })
    }

    try {
        const invitation = await Invitation.findById(invitationId)

        if (!invitation) {
            return res.status(400).json({
                title: '_400_ERROR_TITLE',
                message: '_400_ERROR_MESSAGE'
            })
        }

        invitation.status = "REJECTED"
        const rejectedInvitation = await invitation.save()

        // Populate the 'user' field
        const populatedInvite = await Invitation.findById(rejectedInvitation._id).populate({
            path: 'workspace',
            populate: {
                path: 'members.user'
            }
        })
            .populate('user')

        res.json({
            invitation: populatedInvite
        })
    } catch (error) {
        handleError(res, error)
    }
}

const doAccept = async (req, res) => {
    const { invitationId } = req.query

    if (!invitationId) {
        return res.status(400).json({
            title: '_400_ERROR_TITLE',
            message: '_400_ERROR_MESSAGE'
        })
    }

    try {
        const invitation = await Invitation.findById(invitationId)

        if (!invitation) {
            return res.status(400).json({
                title: '_400_ERROR_TITLE',
                message: '_400_ERROR_MESSAGE'
            })
        }

        // Validate expiration date
        const currentDateTime = new Date().getTime();
        const expiration = new Date(invitation.expiration).getTime();

        if (currentDateTime > expiration) {
            return res.status(400).json({
                title: '_400_ERROR_TITLE',
                message: 'Invitation has expired',
            });
        }

        invitation.status = "ACCEPTED"
        const acceptedInvitation = await invitation.save()

        const workspace = await Workspace.findById(acceptedInvitation.workspace)

        if (!workspace) {
            return res.status(400).json({
                title: '_400_ERROR_TITLE',
                message: 'Could not find workspace when accepting invitation.',
            });
        }

        const newMember = {
            user: acceptedInvitation.user,
            role: acceptedInvitation.role
        }

        if (!isMemberInWorkspace(workspace.members, acceptedInvitation.user)) {
            workspace.members.push(newMember)
            const updatedWorkpace = await workspace.save()
        }

        // Populate the 'user' field
        const populatedInvite = await Invitation.findById(acceptedInvitation._id).populate({
            path: 'workspace',
            populate: {
                path: 'members.user'
            }
        })
            .populate('user')

        res.json({
            invitation: populatedInvite
        })

    } catch (error) {
        handleError(res, error)
    }
}

const removeAllInvitation = async (req, res) => {
    try {

        await Invitation.deleteMany()

        res.json('all invitation deleted')
    } catch (error) {
        handleError(res, error)
    }
}

const removeInvitation = async (req, res) => {
    try {
        const { _id } = req.query
        const deletedInvitation = await Invitation.findByIdAndRemove(_id)

        if (!deletedInvitation) {
            return res.status(400).json({
                title: '_400_ERROR_TITLE',
                message: '_400_ERROR_MESSAGE'
            })
        }

        res.json({
            success: true
        })

    } catch (error) {
        handleError(res, error)
    }
}

module.exports = { doInvite, getAllInvitation, getInvitationByUserId, getInvitationByWorkspaceId, doReject, doAccept, removeAllInvitation, removeInvitation }