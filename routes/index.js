var express = require('express');
var router = express.Router();
var User = require('../app/models/user');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var config = require('../config/main'); //node expect js files. thus you don't need to write .js here
var security = require('../security/securityhelper');
var algorithm = "aes-256-ctr";

//register new users
router.post('/register', function (req, res) {
    console.log(req.body.email + ", " + req.body.password);
    if (!req.body.email || !req.body.password) {
        res.json({success: false, message: 'Please enter an email address and password to register'});
    } else {
        //create the required keys
        var keyPair = security.createKeyPair();
        console.log("keypair: " + keyPair.privateKey + "\n" + keyPair.publicKey);
        var privateKeyEnc = security.symmetricEncrypt(keyPair.privateKey, algorithm, req.body.password);
        console.log("private key enc: " + privateKeyEnc);
        var encryptionKey = security.generateUUID(); //TODO replace with real library
        console.log("encryption key  : " + encryptionKey);
        var encryptionKeyEnc = security.encryptStringWithRsaPublicKey(encryptionKey, keyPair.publicKey);
        console.log("encryption key enc : " + encryptionKeyEnc);

        var newUser = new User({
            email: req.body.email,
            password: req.body.password,
            publicKey: keyPair.publicKey,
            privateKeyEnc: privateKeyEnc,
            encryptionKeyEnc: encryptionKeyEnc
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
                    var privateKey = security.symmetricDecrypt(user.privateKeyEnc, algorithm, req.body.password);
                    console.log(privateKey);
                    //Decrypt the encryption key using the decrypted private key
                    var encryptionKey = security.decryptStringWithRsaPrivateKey(user.encryptionKeyEnc, privateKey)
                    console.log("encryption key: " + encryptionKey);
                    var cookie ={
                        user: user.email,
                        encKey: encryptionKey
                    }
                    req.session.user = cookie; //encrypted session information

                    res.json({success: true, message: 'Âuthenticated'});
                } else {
                    //PW doesn't match
                    res.send({success: false, message: 'Authentication failed. Passwords did not match.'});
                }
            });
        }
    });
});


module.exports = router;
