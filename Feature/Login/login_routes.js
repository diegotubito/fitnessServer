const {Router, model} = require('express')
const doLogin = require('./login_controller')
const router = Router()

router.post('/login', doLogin)

module.exports = router