const express = require('express')
const app = express()
const cors = require('cors')
const {connectDataBase} = require('../Feature/Database/database_controller')
const http = require('http');
const socketIO = require('socket.io');
const RemoteNotification = require('../Apns/apns')

class Server {
    constructor() {
        this.app = app;
        this.server = http.createServer(this.app);
        this.io = socketIO(this.server);
        this.app.io = this.io
        this.app.timers = {}

        this.#middleware();
        this.#routes();
        this.#configureSockets();

        this.app.clients = new Map()
        
        this.app.remoteNotification = new RemoteNotification()
    }

    #middleware() {
        this.app.use(cors())
        this.app.use(express.json())
    }

    #routes() {
        this.app.use('', require('../Feature/ServerConnection/server_connection_routes'))
        this.app.use('/api/v1', require('../Feature/User/user_routes'))
        this.app.use('/api/v1', require('../Feature/Login/login_routes'))
        this.app.use('/api/v1', require('../Feature/EmailVerify/email_verify_routes'))
    }

    #configureSockets() {
        this.io.on('connection', (socket) => {
            console.log('New client connected:', socket.id);
    
            socket.on('register-user', (userId) => {
                this.app.clients.set(userId, socket.id);
                console.log('registered:', userId)
            });

            socket.on('unregister-user', (userId) => {
                this.app.clients.delete(userId);
                console.log('unregistered: ', userId)
            });
    
            // Add your custom event listeners here
    
            socket.on('disconnect', () => {
                // Remove the disconnected client from the clients Map
                for (const [userId, storedSocketId] of this.app.clients.entries()) {
                    if (storedSocketId === socket.id) {
                        this.app.clients.delete(userId);
                        break;
                    }
                }
                console.log('Client disconnected:', socket.id);
            });
        });
    }

    connect() {
        this.server.listen(process.env.PORT, () => {
            this.#connectDB();
        });
    }

    #connectDB() {
        connectDataBase()
    }
}

module.exports = Server