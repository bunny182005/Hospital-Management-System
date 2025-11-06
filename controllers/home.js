var express = require ('express');
var router = express.Router();
var db = require.main.require ('./models/db_controller');

// Middleware to check if user is a patient
router.use('/', function(req, res, next) {
    if (req.session.loggedin && req.session.role === 'patient') {
        next();
    } else {
         // If a doctor is logged in, send them to their dashboard
        if (req.session.role === 'doctor') {
            return res.redirect('/doctor/dashboard');
        }
        res.status(403).send('Access Denied: You must be a patient to view this page.');
    }
});

// GET /home
router.get('/',function(req,res){

    // Fetch two sets of data in parallel
    var patientId = req.session.user_id;
    
    db.getAllDoctors((err, doctors) => {
        if (err) {
            console.log(err);
            return res.send('Error fetching doctors.');
        }
        
        db.getAppointmentsForPatient(patientId, (err, appointments) => {
            if (err) {
                console.log(err);
                return res.send('Error fetching appointments.');
            }
            
            res.render('home.ejs', {
                username: req.session.username,
                doctors: doctors,
                appointments: appointments
            });
        });
    });
});

module.exports = router;