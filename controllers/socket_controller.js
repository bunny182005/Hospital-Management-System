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
        console.log(`User connected to socket: ${username} (ID: ${socket.id})`);

        
        // ======================================
        // --- CHAT LOGIC (FIXED) ---
        // ======================================
        socket.on('joinRoom', (appointmentId) => {
            const room = `appointment_${appointmentId}`;
            socket.join(room);
            console.log(`${username} joined chat room: ${room}`);
            
            db.getChatHistory(appointmentId, (err, history) => {
                if (err) return console.log(err);
                
                // --- THIS IS THE FIX ---
                // The 'history' variable IS the array of messages.
                // We must send the whole 'history' array, NOT 'history[0]'.
                socket.emit('chatHistory', history);
            });
        });

        socket.on('sendMessage', (data) => {
            const { appointmentId, message } = data;
            const room = `appointment_${appointmentId}`;
            db.saveMessage(appointmentId, userId, message, (err, result) => {
                if (err) return console.log('Error saving message:', err);
                const messagePayload = {
                    sender_name: username,
                    message_text: message,
                    timestamp: new Date()
                };
                io.to(room).emit('newMessage', messagePayload);
            });
        });

        // ======================================
        // --- VIDEO CALL LOGIC (Existing) ---
        // ======================================
        let currentVideoRoom = null;

        // 1. User joins a video room
        socket.on('join-video-room', (roomName) => {
            socket.join(roomName);
            currentVideoRoom = roomName;
            console.log(`${username} joined video room: ${roomName}`);
            
            socket.to(roomName).emit('other-user-joined', socket.id);
        });

        // 2. Forward the offer
        socket.on('offer', (payload) => {
            io.to(payload.target).emit('offer', {
                offer: payload.offer,
                from: socket.id
            });
        });

        // 3. Forward the answer
        socket.on('answer', (payload) => {
            io.to(payload.target).emit('answer', {
                answer: payload.answer,
                from: socket.id
            });
        });

        // 4. Forward the ICE candidates
        socket.on('ice-candidate', (payload) => {
            io.to(payload.target).emit('ice-candidate', {
                candidate: payload.candidate,
                from: socket.id
            });
        });
        
        // 5. User hangs up
        socket.on('hang-up', () => {
            if (currentVideoRoom) {
                socket.to(currentVideoRoom).emit('user-left', socket.id);
            }
        });

        // ======================================
        // --- DISCONNECT (Handles both) ---
        // ======================================
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${username} (ID: ${socket.id})`);
            if (currentVideoRoom) {
                socket.to(currentVideoRoom).emit('user-left', socket.id);
            }
        });
    });
};