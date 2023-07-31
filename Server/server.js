const express = require('express')
const app = express()
const cors = require('cors')
const {connectDataBase} = require('../Features/Database/database_controller')
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
        this.app.use('', require('../Features/Database/database_routes'))
        /*
        this.app.use('', require('../Feature/User/user_router'))
        this.app.use('', require('../Feature/Item/item_routes'))
        this.app.use('', require('../Feature/Spot/spot_routes'))
        this.app.use('', require('../Feature/Availability/availability.route'))
        this.app.use('', require('../Feature/Assignment/assignment_route'))
        this.app.use('', require('../Feature/Image/image_route'))

        this.app.use('/api/v1/auth', require('../Feature/Login/login_router'))
        this.app.use('/api/v1/stripe', require('../Feature/Stripe/stripe_route'))
        this.app.use('/api/v1/mp', require('../Feature/MercadoPago/mp_link_router'))
        this.app.use('/api/v1/mp/sdk', require('../Feature/MercadoPago/mp_sdk_router'))
        */
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
            console.log('Server running at', process.env.PORT);
        });
    }
}

module.exports = Server