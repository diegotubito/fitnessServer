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
    deleteWorkspaceLocation,
    getWorkspaceAll,
    addDocument,
    removeDocument, 
    addDefaultImage,
    addDefaultBackgroundImage,
    pushWorkspaceImage,
    pullWorkspaceImage} = require('./workspace_controller')
const router = Router()

router.get('/workspace-all', getWorkspaceAll)
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
router.post('/add-document-workspace', addDocument)
router.delete('/add-document-workspace', removeDocument)
router.post('/workspace/default-image', addDefaultImage)
router.post('/workspace/default-background-image', addDefaultBackgroundImage)
router.post('/workspace/image', pushWorkspaceImage)
router.delete('/workspace/image', pullWorkspaceImage)

module.exports = router