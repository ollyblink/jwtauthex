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
    res.json({"data":'hello world'}).status(200);
});
//register new users
router.post('/register', function (req, res) {
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

var tokenExpirationTime = 120; //token expires after two minutes
//Authenticate the user and get a JWT
router.post('/authenticate', function (req, res) {
    console.log("Received auth: "+  req.body.email  +", " + req.body.password)
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
                    var token = jwt.sign(user, config.secret, {
                            expiresIn: tokenExpirationTime//in seconds
                        }
                    );
                    console.log("Auth: created new token: "+ token);
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
    res.send({data: 'it worked! USer id is : ' + req.user._id + '.'});//_id is autoincrement
});

module.exports = router;
