var express = require('express');
var router = express.Router();
var User = require('../app/models/user');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var config = require('../config/main'); //node expect js files. thus you don't need to write .js here
var security = require('../security/securityhelper');
var algorithm = "aes-256-ctr";
var ExtractJwt = require('passport-jwt').ExtractJwt;

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
                    //TODO what to do with the decrypted encryption key? Store it in a session, JWT, or not at all

                    var tokenPayload = {
                        email: user.email,
                        encKey: encryptionKey
                    }
                    var token = jwt.sign(tokenPayload, config.secret, {
                        expiresIn: 11111,//in seconds
                    });

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

/**
 * TODO: implement as aspect
 * @returns {*}
 */
function getEncryptionKey(req) {
    var jwtFromRequest = ExtractJwt.fromAuthHeader();
    var token = jwtFromRequest(req);
    var encryptionKey = jwt.verify(token, config.secret).encKey;
    return encryptionKey;
}

function getUsername(req) {
    var jwtFromRequest = ExtractJwt.fromAuthHeader();
    var token = jwtFromRequest(req);
    var username = jwt.verify(token, config.secret).email;
    return username;
}
router.get('/spirometrydata', passport.authenticate('jwt', {session: false}), function (req, res) {
    var encryptionKey = getEncryptionKey(req);
    var username = getUsername(req);
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
                var data =[];
                for(var i = 0; i < user.spirometryData.length;++i){
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

router.post('/spirometrydata', passport.authenticate('jwt', {session: false}), function (req, res) {
    var encryptionKey = getEncryptionKey(req);
    console.log(req.body.title );
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
    console.log("data as string: "+dataString);
    var encryptedDataString = security.symmetricEncrypt(dataString, algorithm, encryptionKey);

    console.log("Encrypted data: "+ encryptedDataString);
    User.findOne({
            email: getUsername(req)//That's the username...
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
