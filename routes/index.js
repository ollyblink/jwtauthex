var express = require('express');
var router = express.Router();
var User = require('../app/models/user');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var config = require('../config/main'); //node expect js files. thus you don't need to write .js here


/* GET home page. */
router.get('/', function (req, res) {
    res.send("d");
});

router.get('/data', function (req, res) {
    res.json({"data": 'hello world'}).status(200);
});

//register new users
router.post('/register', function (req, res) {
    console.log(req.body.email + ", " + req.body.password);
    if (!req.body.email || !req.body.password) {
        res.json({success: false, message: 'Please enter an email address and password to register'});
    } else {
        var newUser = new User({
            email: req.body.email,
            password: req.body.password
        });

        //Attempt to save the new users
        newUser.save(function (err) {
            if (err) {
                return res.json({success: false, message: 'That email address already exists.'});
            }
            res.json({success: true, message: 'Successfully created new user.'});
        });
    }
});

/**
 *  easier to configure token here
 * @returns {*}
 */
function createToken(user) {
    return jwt.sign(user, config.secret, {
            expiresIn: 120//in seconds
        }
    );
}

//Authenticate the user and get a JWT
router.post('/authenticate', function (req, res) {
    console.log("Received auth: " + req.body.email + ", " + req.body.password)
    User.findOne({
        email: req.body.email //That's the username...
    }, function (err, user) {
        if (err) {
            throw err;
        }
        if (!user) {
            res.send({success: false, message: 'Authentication failed! User not found.'});
        } else {
            //check if pw matches (username matches so far)s
            user.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                    //create the jwt!
                    var token = createToken(user);
                    res.json({success: true, token: 'JWT ' + token});
                } else {
                    //PW doesn't match
                    res.send({success: false, message: 'Authentication failed. Passwords did not match.'});
                }
            });
        }
    });
});

//Protect dashboard route with JWT //test it works
router.get('/dashboard', passport.authenticate('jwt', {session: false}), function (req, res) {
    res.send({data: 'it worked! User id is : ' + req.user.email + '.'});//_id is autoincrement
});

router.get('/spirometrydata', passport.authenticate('jwt', {session: false}), function (req, res) {
    console.log("spirometrydata");
    User.find('spirometrydata').where('email').equals(req.user.email).select('spirometryData').exec(function (err, data) {
        if (!err) {
            console.log("found data for user " + req.user.email + ": " + data);
            res.send(data);
        } else {
            console.log("Redirected because of error: " + err);
            res.redirect('/');
        }
    });

});

module.exports = router;
