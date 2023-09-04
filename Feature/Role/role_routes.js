const Router = require('express')
const { getRole, createRole, updateRole, deleteRole, deleteAllRole } = require('./role_controller')
const router = Router()

router.get('/role', getRole)
router.post('/role', createRole)
router.put('/role', updateRole)
router.delete('/role', deleteRole)
router.delete('/role-all', deleteAllRole)

module.exports = router