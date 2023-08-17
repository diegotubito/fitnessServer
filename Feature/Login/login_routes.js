const {Router, model} = require('express')
const {doLogin, enable2FA, verify2FA, disable2FA, disable2FA_backend, setTwoFactorEnabled, verify2FAWithNoTempToken} = require('./login_controller')
const verifyToken = require('../../Middleware/verify_token')
const router = Router()

router.post('/login', doLogin)
router.post('/enable2FA', [verifyToken], enable2FA)
router.post('/verify2FA', verify2FA)
router.post('/verify2FA_withouth_temptoken', [verifyToken], verify2FAWithNoTempToken)
router.post('/disable2FA', [verifyToken], disable2FA)
router.post('/disable2FA_backend', disable2FA_backend)
router.post('/confirmEnable2FA', [verifyToken], setTwoFactorEnabled)

module.exports = router