const {Router, model} = require('express')
const {doLogin, enable2FA, verify2FA, disable2FA, disable2FA_backend} = require('./login_controller')
const verifyToken = require('../../Middleware/verify_token')
const router = Router()

router.post('/login', doLogin)
router.post('/enable2FA', [verifyToken], enable2FA)
router.post('/verify2FA', verify2FA)
router.post('/disable2FA', [verifyToken], disable2FA)
router.post('/disable2FA_backend', disable2FA_backend)

module.exports = router