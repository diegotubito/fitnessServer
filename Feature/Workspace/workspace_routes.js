const Router = require('express')
const { getWorkspace,
    updateWorkspace,
    createWorkspace,
    deleteWorkspace,
    deleteAllWorkspace,
    getWorkspaceByUserId,
    updateAddress, 
    verifyAddress, 
    deleteWorkspaceMember, 
    deleteWorkspaceLocation} = require('./workspace_controller')
const router = Router()

router.get('/workspace', getWorkspace)
router.get('/workspace-by-user-id', getWorkspaceByUserId)
router.put('/workspace', updateWorkspace)
router.post('/workspace', createWorkspace)
router.delete('/workspace', deleteWorkspace)
router.delete('/workspace-delete-all', deleteAllWorkspace)
router.delete('/workspace-delete-member', deleteWorkspaceMember)
router.delete('/workspace-delete-location', deleteWorkspaceLocation)
router.put('/workspace/update-address', updateAddress)
router .put('/workspace/verify', verifyAddress)

module.exports = router