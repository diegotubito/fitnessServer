const { Router } = require('express')
const { connectDataBase, disconnectDataBase } = require('./database_controller')
const router = Router()

router.post('/database/connect', connectDataBase)
router.post('/database/disconnect', disconnectDataBase)

module.exports = router