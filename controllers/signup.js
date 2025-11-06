var express = require ('express');
var router = express.Router();
var bodyParser = require('body-parser');
var db = require.main.require ('./models/db_controller');
var mysql = require('mysql2');
var nodemailer = require('nodemailer');
var randomToken = require ('random-token');
var bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');

const saltRounds = 10;

router.use(bodyParser.urlencoded({extended : true}));
router.use(bodyParser.json());

// --- THIS IS THE FIX ---
// Your template needs 'title' and other variables to be defined.
router.get('/',function(req,res){
    res.render('signup.ejs', {
        title: 'Create Account',
        errors: '', // Initialize as empty
        successMessage: '', // Initialize as empty
        username: '', // Initialize as empty
        email: '' // Initialize as empty
    });
});
// --- END FIX ---

router.post('/',[check('username').notEmpty().withMessage("Username is required"),
check('password').notEmpty().withMessage("Password is required"),
check('email').notEmpty().isEmail().withMessage('Valid Email required')],function(req , res){

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If validation fails, re-render the page with errors and old values
        // This is better than returning JSON
        return res.render('signup.ejs', {
            title: 'Create Account',
            errors: errors.array().map(e => e.msg).join('<br>'), // Format errors
            successMessage: '',
            username: req.body.username, // Send back old username
            email: req.body.email // Send back old email
        });
    }
    
    var email = req.body.email;
    var username = req.body.username;
    var email_status = "not_verified";

    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        if (err) {
            console.log('Error hashing password:', err);
            return res.send('Error creating account.');
        }

        db.signup(username, email, hash, email_status, function(err, result) {
            if (err) {
                console.log('Error signing up user:', err);
                if (err.code === 'ER_DUP_ENTRY') {
                    // Re-render the page with the specific error
                    return res.render('signup.ejs', {
                        title: 'Create Account',
                        errors: 'Username or email already exists.',
                        successMessage: '',
                        username: req.body.username,
                        email: req.body.email
                    });
                }
                return res.send('Error creating account. Please try again.');
            }

            // 2. User is created. Now create verification token.
            var token = randomToken(8);
            
            db.verify(username, email, token, function(err, verifyResult) {
                if (err) {
                    console.log('Error saving verification token:', err);
                    return res.send('Error creating verification token. Please try again.');
                }

                // 3. Get the new ID from the verify table
                var id = verifyResult.insertId;

                // 4. Send verification email
                var output =  `
                    <p>Dear `+username+`, </p>
                    <p>Thanks for signing up. Please click the link below to verify your email address:</p>
                    <p><a href="http://localhost:3000/verify?id=`+ id +`&token=`+ token +`">Click Here to Verify Your Account</a></p>
                    <p><strong>This is an automatically generated mail. Please do not reply back.</strong></p>
                `;

                var transporter = nodemailer.createTransport({
                    service : 'gmail',
                    auth: {
                        user: 'saraswathimedikonduru521@gmail.com',
                        pass: 'stmr ivsi xzjr lsef' // Note: Be careful with hardcoding passwords
                    }
                });
                var mailOptions = {
                    from: 'saraswathimedikonduru521@gmail.com', 
                    to: email, 
                    subject: 'Email Verification',
                    html: output
                };

                transporter.sendMail(mailOptions,function(err,info){
                    if(err) {
                        return console.log(err);
                    }
                    console.log(info);
                });

                // Render the page with a success message
                res.render('signup.ejs', {
                    title: 'Account Created',
                    errors: '',
                    successMessage: 'Account created! Please check your email to verify your account.',
                    username: '',
                    email: ''
                });
            });
        });
    });
});

module.exports = router;