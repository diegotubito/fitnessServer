const { request } = require('express');

function emit(req = request, userIds, eventKey, message) {
    // Access the io instance from the app object
    const { io, clients } = req.app;

    for (const userId of userIds) {
        // Get the socket ID of the user you want to send the message to
        const targetSocketId = clients.get(userId);

        if (targetSocketId) {
            // Emit the message only to the specific client
            io.to(targetSocketId).emit(eventKey, message);
        }
    }
}

module.exports = { emit }
