const Router = require('express')
const { doInvite, getAllInvitation, getInvitationByUserId, getInvitationByWorkspaceId, doReject, doAccept, removeAllInvitation } = require('./invite_controller')
const router = Router()

router.get('/invitation', getAllInvitation)
router.get('/invitation-by-user', getInvitationByUserId)
router.get('/invitation-by-workspace', getInvitationByWorkspaceId)

router.post('/invitation', doInvite)
router.post('/reject-invitation', doReject)
router.post('/accept-invitation', doAccept)

router.delete('/invitation', removeAllInvitation)

module.exports = router