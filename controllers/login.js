var express = require ('express');
var mysql =require('mysql2');
var session = require ('express-session');
var router = express.Router();
var bodyParser = require('body-parser');
var db = require.main.require ('./models/db_controller');
var bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');

router.get('/', function(req ,res){
    res.render('login.ejs');
});

var con = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'BUbu00*#',
    database : 'nodelogin'
});

router.use(session({
    secret: 'secret',
    resave : true ,
    saveUninitialized : true 
}));

router.use(bodyParser.urlencoded({extended : true}));
router.use(bodyParser.json());

router.post('/',[
    check('username').notEmpty().withMessage("Username is required"),
    check('password').notEmpty().withMessage("Password is required")
    
], function(request , response){
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(422).json({ errors: errors.array() });
    }

    var username = request.body.username;
    var password = request.body.password;

    if (username && password){
        
        con.query('SELECT * FROM users WHERE username = ?' , [username], function(error , results , fields){
            
            if (results.length > 0){
                
                var stored_hash = results[0].password;
                bcrypt.compare(password, stored_hash, function(err, isMatch) {
                    if (err) {
                        console.log(err);
                        response.send('An error occurred.');
                        return response.end();
                    }

                    if (isMatch) {
                        // --- PASSWORD IS CORRECT ---
                        
                        request.session.loggedin = true ; 
                        request.session.username = username;
                        request.session.user_id = results[0].id;
                        request.session.role = results[0].role;
                        
                        response.cookie('username' , username);
                        
                        // --- THIS IS THE UPDATED REDIRECT ---
                        if (results[0].role === 'admin') {
                            response.redirect('/admin/dashboard');
                        } else if (results[0].role === 'doctor') {
                            response.redirect('/doctor/dashboard');
                        } else {
                            // Default to patient dashboard
                            response.redirect('/home');
                        }

                    } else {
                        // --- PASSWORD IS INCORRECT ---
                        response.send('Incorrect username / password');
                    }
                    response.end();
                });

            } else {
                // --- USERNAME NOT FOUND ---
                response.send('Incorrect username / password');
                response.end();
            }
        });

    } else {
        response.send('please enter user name and password');
        response.end();
    }
});

module.exports = router;