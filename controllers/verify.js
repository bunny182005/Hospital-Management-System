var express = require ('express');
var router = express.Router();
var bodyParser = require('body-parser');
var db = require.main.require ('./models/db_controller');

router.use(bodyParser.urlencoded({extended : true}));
router.use(bodyParser.json());

module.exports = router;

// This GET route handles EVERYTHING.
// It reads the ID and Token from the URL link
router.get('/',function(req,res){
    
    // Read from the URL (e.g., /verify?id=17&token=ysacf0f7)
    var id = req.query.id;
    var token = req.query.token;

    // Check if ID and Token exist
    if (!id || !token) {
        return res.send('Invalid verification link.');
    }

    db.matchtoken(id,token,function(err,result){
        
        if (result.length > 0){
            var email = result[0].email;
            var email_status = "verified";
            db.updateverify (email,email_status,function(err,result1){
                
                // Success! Send them to the login page
                console.log('User ' + email + ' verified.');
                res.redirect('/login');
            });
        }
        else {
            // This is the error you are seeing.
            // It means your db.matchtoken function failed to find a match.
            res.send('Token did not match or has expired.');
        }
    });
});

// We DO NOT need the POST route anymore.
// We DO NOT need the res.render('verify.ejs') anymore.