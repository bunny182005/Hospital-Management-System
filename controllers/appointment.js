var express = require ('express');
var router = express.Router();
var db = require.main.require ('./models/db_controller');

// Middleware to check if user is logged in
router.use('/', function(req, res, next) {
    if (req.session.loggedin) {
        next();
    } else {
        res.status(403).send('Please log in to make an appointment.');
    }
});

// POST /appointment/book
router.post('/book', function(req, res) {
    var patientId = req.session.user_id;
    var doctorId = req.body.doctor_id;
    var appointmentDate = req.body.appointment_date;

    // 1. Get the doctor's fee first
    db.getDoctorById(doctorId, (err, docResult) => {
        // --- FIX ---
        // Was docResult[0].length, which is wrong.
        if (err || docResult.length === 0) {
            console.log(err);
            return res.send('Error: Doctor not found.');
        }
        
        // --- FIX ---
        // Was docResult[0][0], which is wrong.
        var fee = docResult[0].consultation_fee;

        // 2. Create the appointment with the correct fee
        db.createAppointment(patientId, doctorId, appointmentDate, fee, (err, result) => {
            if (err) {
                console.log(err);
                return res.send('Error booking appointment. Please try again.');
            }
            
            res.redirect('/home');
        });
    });
});

// GET /appointment/medications/:id
router.get('/medications/:id', function(req, res) {
    var appointmentId = req.params.id;
    
    // Security check
    db.getAppointmentsForPatient(req.session.user_id, (err, appts) => {
        // --- FIX ---
        // Was appts[0].find, which is wrong.
        var a = appts.find(ap => ap.id == appointmentId);
        
        if (!a) {
            return res.status(403).send('Access Denied');
        }
        
        // Appointment is valid, now get meds
        db.getMedicationsForAppointment(appointmentId, (err, meds) => {
            if (err) {
                console.log(err);
                return res.send('Error fetching medications.');
            }
            // --- FIX ---
            // Was meds[0], which is wrong.
            res.render('view_medications.ejs', {
                medications: meds, // Send the rows
                appointment: a
            });
        });
    });
});

// --- THIS IS THE ROUTE THAT CRASHED ---
// GET /appointment/chat/:id
router.get('/chat/:id', function(req, res) {
    var appointmentId = req.params.id;
    var currentUserId = req.session.user_id;

    if (!currentUserId) {
        return res.status(403).send('Error: You must be logged in to chat.');
    }

    // 2. Check if this user is part of this appointment
    db.getAppointmentParticipants(appointmentId, (err, participants) => {
        // --- FIX ---
        // Was participants[0].length, which is wrong.
        if (err || participants.length === 0) {
            console.log(err);
            return res.status(404).send('Appointment not found.');
        }

        // --- FIX ---
        // Was participants[0][0], which caused the crash.
        const appt = participants[0];
        
        // 3. Check if current user is the patient OR the doctor
        if (currentUserId === appt.patient_id || currentUserId === appt.doctor_user_id) {
            // User is authorized
            res.render('chat_room.ejs', {
                appointmentId: appointmentId,
                username: req.session.username
            });
        } else {
            // User is not part of this chat
            res.status(403).send('Access Denied: You are not a participant in this chat.');
        }
    });
});

module.exports = router;