const db = require.main.require('./models/db_controller');

module.exports = function(io) {

    io.on('connection', (socket) => {
        // --- AUTHENTICATION ---
        const session = socket.request.session;

        if (!session.loggedin) {
            console.log('Socket connection denied: User not logged in.');
            socket.disconnect();
            return;
        }

        const userId = session.user_id;
        const username = session.username;
        console.log(`User connected to socket: ${username} (ID: ${userId})`);

        // --- 1. JOINING A CHAT ROOM ---
        socket.on('joinRoom', (appointmentId) => {
            const room = `appointment_${appointmentId}`;
            socket.join(room);
            console.log(`${username} joined room: ${room}`);

            // Send chat history to the user who just joined
            db.getChatHistory(appointmentId, (err, history) => {
                if (err) {
                    console.log(err);
                    return;
                }
                
                // --- THIS IS THE FIX ---
                // 'history' is an array like [rows, fields].
                // We must send only the 'rows', which is at index 0.
                socket.emit('chatHistory', history[0]);
            });
        });

        // --- 2. HANDLING A NEW MESSAGE ---
        socket.on('sendMessage', (data) => {
            const { appointmentId, message } = data;
            const room = `appointment_${appointmentId}`;

            // 1. Save message to database
            db.saveMessage(appointmentId, userId, message, (err, result) => {
                if (err) {
                    console.log('Error saving message:', err);
                    return;
                }

                // 2. Broadcast the message to everyone in the room
                const messagePayload = {
                    sender_name: username,
                    message_text: message,
                    timestamp: new Date()
                };
                
                io.to(room).emit('newMessage', messagePayload);
                console.log(`Message from ${username} to ${room}: ${message}`);
            });
        });

        // --- 3. HANDLING DISCONNECT ---
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${username}`);
        });
    });
};