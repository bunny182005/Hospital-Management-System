var express = require ('express');
var router = express.Router();
var db = require.main.require ('./models/db_controller');

// GET /video/room/:id
router.get('/room/:id', function(req, res) {
    var appointmentId = req.params.id;
    var currentUserId = req.session.user_id;

    // 1. Check if user is logged in
    if (!currentUserId) {
        return res.status(403).send('Error: You must be logged in to join a call.');
    }

    // 2. Check if this user is part of this appointment
    db.getAppointmentParticipants(appointmentId, (err, participants) => {
        if (err || participants.length === 0) {
            console.log(err);
            return res.status(404).send('Appointment not found.');
        }

        const appt = participants[0];
        
        // 3. Check if current user is the patient OR the doctor
        if (currentUserId === appt.patient_id || currentUserId === appt.doctor_user_id) {
            // User is authorized
            res.render('video_call.ejs', {
                appointmentId: appointmentId,
                username: req.session.username,
                userId: req.session.user_id
            });
        } else {
            // User is not part of this call
            res.status(403).send('Access Denied: You are not a participant in this call.');
        }
    });
});

module.exports = router;