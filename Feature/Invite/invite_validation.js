const handleError = require('../../Common/error_response')
const Invitation = require('./invite_model')
const Workspace = require('../Workspace/workspace_model')
const { isMemberInWorkspace } = require('../../Common/common_functions')

const hasInvitation = async (req, res, next) => {
    const userId = req.body.user

    if (!userId) {
        return res.status(400).json({
            title: '_400_ERROR_TITLE',
            message: '_400_ERROR_MESSAGE'
        })
    }

    try {
        const invitations = await Invitation.find({user: userId})

        if (isThereAnyInvitationActive(invitations)) {
            return res.status(432).json({
                title: '_432_INVITATION_ERROR_TITLE',
                message: '_432_INVITATION_ERROR_MESSAGE'
            })
        }

        next()

    } catch (error) {
        handleError(res, error)
    }

}

const isAlreadyMember = async (req, res, next) => {
    const workspaceId = req.body.workspace
    const userId = req.body.user

    if (!workspaceId || !userId) {
        return res.status(400).json({
            title: '_400_ERROR_TITLE',
            message: '_400_ERROR_MESSAGE'
        })
    }

    try {
        const workspace = await Workspace.findById(workspaceId)
        
        if (!workspace) {
            return res.status(400).json({
                title: '_400_ERROR_TITLE',
                message: '_400_ERROR_MESSAGE'
            })
        }

        if (!workspace.isEnabled) {
            return res.status(432).json({
                title: '_432_WORKSPACE_NOT_ENABLED_TITLE',
                message: '_432_WORKSPACE_NOT_ENABLED_MESSAGE'
            })
        }

        if (workspace.owner.toString() === userId) {
            return res.status(432).json({
                title: '_432_ERROR_TITLE',
                message: '_432_YOU_ARE_THE_OWNER'
            })
        }

        if (isMemberInWorkspace(workspace.members, userId)) {
            return res.status(432).json({
                title: '_432_ERROR_TITLE',
                message: '_432_ALREADY_MEMBER'
            })
        }
        
        next()
    } catch (error) {
        handleError(res, error)
    }
}

const isThereAnyInvitationActive = (invitations) => {
    if (!invitations) {
        return false
    }
    // Get the current time
    const currentDateTime = new Date().getTime();
  
    // Loop through each invitation
    for (const invitation of invitations) {
      // Parse expiration time from invitation
      const expiration = new Date(invitation.expiration).getTime();
  
      // Check if the invitation is not expired and is pending
      if (currentDateTime < expiration && invitation.status === 'PENDING') {
        return true; // There is at least one non-expired, pending invitation
      }
    }
  
    return false; // No non-expired, pending invitations were found
}

module.exports = { hasInvitation, isAlreadyMember }