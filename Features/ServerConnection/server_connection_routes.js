const { Router } = require('express')
const ServerConnection = require('./server_connection_controller')
const router = Router()

router.get('server/connected', ServerConnection)

module.exports = router