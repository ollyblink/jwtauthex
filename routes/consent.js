var express = require('express');
var router = express.Router();
var User = require('../app/models/user');
var Consent = require('../app/models/consent');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var config = require('../config/main'); //node expect js files. thus you don't need to write .js here
var security = require('../security/securityhelper');
var algorithm = "aes-256-ctr";

router.get('/', passport.authenticate('jwt', {session: false}), function (req, res) {
    var encryptionKey = security.getEncryptionKey(req);
    var username = security.getUsername(req);
    console.log("Decoded: for user " + username + " is " + encryptionKey);

    User.findOne({
        email: username //That's the username...
    }, function (err, user) {
        if (err) {
            throw err;
        }
        if (!user) {
            res.send({success: false, message: 'Authentication failed! User not found.'});
        } else {
            if (!err) {
                var data = [];
                for (var i = 0; i < user.spirometryData.length; ++i) {
                    var jsonData = JSON.parse(security.symmetricDecrypt(user.spirometryData[i], algorithm, encryptionKey));
                    data.push(jsonData);
                }
                res.json(data);
            } else {
                console.log("Redirected because of error: " + err);
                res.redirect('/');
            }
        }
    });

});

/**
 * req.body.receiver needs to be set
 */
router.post('/', passport.authenticate('jwt', {session: false}), function (req, res) {
    var encryptionKey = security.getEncryptionKey(req);
    var username = security.getUsername(req);
    User.findOne({email: req.body.receiver}, function (err, receiver) {
        if (err) {
            res.status(404).send("could not find user with username " + req.body.usernames);
        }

        //encrypt the encryption key of the sender with the public key of the receiver
        var encryptionKeyEnc = security.encryptStringWithRsaPublicKey(encryptionKey, receiver.publicKey);
        var newConsent = new Consent({
            sender: username,
            receiver: receiver.email,
            encryptionKeyEnc: encryptionKeyEnc
        });

        newConsent.save(function (err, newConsent) {
            if (err) {
                console.log("could not save new consent for user " + newConsent.receiver);
                return console.error(err);
            } else {
                console.log("Successfully saved new consent for user " + newConsent.receiver);
            }
        });
        res.status(200).send("new consent added for receiver: " + req.body.receiver + " from sender " + newConsent.sender);

    });

});
module.exports = router;
