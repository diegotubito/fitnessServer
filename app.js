require('dotenv').config()
const Server = require('./Server/server')

const server = new Server()
server.connect()