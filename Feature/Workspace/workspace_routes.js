const Router = require('express')
const { getWorkspace, updateWorkspace, createWorkspace, deleteWorkspace, deleteAllWorkspace, getWorkspaceByUserId } = require('./workspace_controller')
const router = Router()

router.get('/workspace', getWorkspace)
router.get('/workspace-by-user-id', getWorkspaceByUserId)
router.put('/workspace', updateWorkspace)
router.post('/workspace', createWorkspace)
router.delete('/workspace', deleteWorkspace)
router.delete('/workspace-delete-all', deleteAllWorkspace)

module.exports = router