const {Router, model} = require('express')
const { sendEmail, setVerifyEmailToTrue } = require('./email_verify_controller')
const verifyToken = require('../../Middleware/verify_token')
const router = Router()

router.post('/sendEmail', [verifyToken], sendEmail)
router.get('/verifyEmail', setVerifyEmailToTrue)

module.exports = router