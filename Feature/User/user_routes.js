const { Router } = require('express')
const { getUsers, createUser, deleteUser, updateUser, disableUser, enableUser, getUsersByUserNameOrEmail } = require('./user_controller')
const validateToken = require('../../Middleware/verify_token')
const router = Router()

router.get('/user', getUsers)
router.post('/user', createUser)
router.delete('/user', [validateToken], deleteUser)
router.put('/user', [validateToken], updateUser)
router.put('/user/disable', [validateToken], disableUser)
router.put('/user/enable', [validateToken], enableUser)
router.get('/user/byUsernameOrEmail', [validateToken], getUsersByUserNameOrEmail)

module.exports = router