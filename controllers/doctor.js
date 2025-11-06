var express = require('express');
var router = express.Router();
var db = require.main.require ('./models/db_controller');

// Middleware to check if user is a doctor
router.use('/', function(req, res, next) {
    if (req.session.loggedin && req.session.role === 'doctor') {
        next();
    } else {
        res.status(403).send('Access Denied: You must be a doctor to view this page.');
    }
});

// GET /doctor/dashboard
// --- THIS IS THE UPDATED ROUTE ---
// GET /doctor/dashboard
router.get('/dashboard', function(req, res) {
    
    // First, get the doctor's own ID from their user_id
    db.getDoctorIdByUserId(req.session.user_id, (err, docResult) => {
        if (err || docResult.length === 0) {
            console.log(err);
            return res.send('Error: Could not find doctor profile.');
        }
        
        var doctorId = docResult[0].id;
        
        // 1. Get Appointments List
        db.getAppointmentsForDoctor(doctorId, (err, appointments) => {
            if (err) return res.send('Error fetching appointments.');

            // 2. Get Total Earnings
            db.getDoctorAnalytics_Earnings(doctorId, (err, earningsResult) => {
                if (err) return res.send('Error fetching earnings.');
                // --- FIX: Convert string to number ---
                const totalEarnings = earningsResult[0] ? parseFloat(earningsResult[0].totalEarnings) : 0;

                // 3. Get Total Appointments Count
                db.getDoctorAnalytics_TotalAppointments(doctorId, (err, apptCountResult) => {
                    if (err) return res.send('Error fetching appt count.');
                    // --- FIX: Convert string to number (using parseInt for whole numbers) ---
                    const totalAppointments = apptCountResult[0] ? parseInt(apptCountResult[0].totalAppointments, 10) : 0;

                    // 4. Get Active Patients Count
                    db.getDoctorAnalytics_ActivePatients(doctorId, (err, patientCountResult) => {
                        if (err) return res.send('Error fetching patient count.');
                        // --- FIX: Convert string to number ---
                        const activePatients = patientCountResult[0] ? parseInt(patientCountResult[0].activePatients, 10) : 0;

                        // 5. Get Average Rating
                        db.getDoctorAnalytics_AvgRating(doctorId, (err, ratingResult) => {
                            if (err) return res.send('Error fetching rating.');
                            // --- FIX: Convert string to number ---
                            const avgRating = ratingResult[0] ? parseFloat(ratingResult[0].avgRating) : 0.0;

                            // 6. Get Appointment Chart Data
                            db.getDoctorChart_Appointments(doctorId, (err, apptChartData) => {
                                if (err) return res.send('Error fetching appt chart.');

                                // 7. Get Earnings Chart Data
                                db.getDoctorChart_Earnings(doctorId, (err, earningsChartData) => {
                                    if (err) return res.send('Error fetching earnings chart.');

                                    // --- Now, build the final data objects ---

                                    // Build the doctorAnalytics object
                                    const doctorAnalytics = {
                                        totalEarnings: totalEarnings,
                                        totalAppointments: totalAppointments,
                                        activePatients: activePatients,
                                        avgRating: avgRating
                                    };

                                    // Process and build the chartData object
                                    const chartData = {
                                        appointmentLabels: apptChartData.map(d => `Week ${d.week_num}`),
                                        appointmentValues: apptChartData.map(d => d.count),
                                        earningsLabels: earningsChartData.map(d => `Week ${d.week_num}`),
                                        // --- FIX: Ensure chart earnings are also numbers ---
                                        earningsValues: earningsChartData.map(d => parseFloat(d.earnings))
                                    };

                                    // --- Finally, render the page with all the data ---
                                    res.render('doctor_dashboard.ejs', {
                                        username: req.session.username,
                                        appointments: appointments,
                                        doctorAnalytics: doctorAnalytics,
                                        chartData: chartData
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
// --- END OF UPDATED ROUTE ---


// POST /doctor/appointments/accept/:id
router.post('/appointments/accept/:id', function(req, res) {
    var appointmentId = req.params.id;
    db.updateAppointmentStatus(appointmentId, 'Confirmed', (err, result) => {
        if (err) {
            console.log(err);
        }
        res.redirect('/doctor/dashboard');
    });
});

// POST /doctor/appointments/reject/:id
router.post('/appointments/reject/:id', function(req, res) {
    var appointmentId = req.params.id;
    db.updateAppointmentStatus(appointmentId, 'Rejected', (err, result) => {
        if (err) {
            console.log(err);
        }
        res.redirect('/doctor/dashboard');
    });
});

// (Optional) Add medication routes
// GET /doctor/medications/:appointment_id
router.get('/medications/:id', function(req, res) {
    var appointmentId = req.params.id;
    // You would also fetch patient name here
    res.render('add_medication.ejs', { // Assuming you have this view
        appointmentId: appointmentId
    });
});

// POST /doctor/medications
router.post('/medications', function(req, res) {
    var { appointment_id, medication_name, dosage, notes } = req.body;
    db.addMedication(appointment_id, medication_name, dosage, notes, (err, result) => {
        if (err) {
            console.log(err);
        }
        res.redirect('/doctor/dashboard');
    });
});

module.exports = router;