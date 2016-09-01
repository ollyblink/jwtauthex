var express = require('express');
var router = express.Router();
var User = require('../app/models/user');
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

router.post('/', passport.authenticate('jwt', {session: false}), function (req, res) {
    var encryptionKey = security.getEncryptionKey(req);
    console.log(req.body.title);
    var title = req.body.title;
    var description = req.body.description;
    var fev1 = req.body.FEV1;
    var fvc = req.body.FVC;

    var spirometryDataSet = {
        title: title,
        description: description,
        fev1: fev1,
        fvc: fvc
    }

    var dataString = JSON.stringify(spirometryDataSet);
    console.log("data as string: " + dataString);
    var encryptedDataString = security.symmetricEncrypt(dataString, algorithm, encryptionKey);

    console.log("Encrypted data: " + encryptedDataString);
    User.findOne({
            email: security.getUsername(req)//That's the username...
        }, function (err, user) {
            if (err) {
                throw err;
            }
            if (!user) {
                res.send({success: false, message: 'Authentication failed! User not found.'});
            } else {
                user.spirometryData.push(encryptedDataString);
                user.save();
                res.send({success: true, message: 'successfully stored data'});
            }
        }
    );

});
module.exports = router;
