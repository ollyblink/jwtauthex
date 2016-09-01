/**
 * As long as the typescript classes are making problems, these functions can be used instead.
 */
//TODO Refactor ... these functions come from AsymmetricEncryptionHelper.ts and SymmetricEncryptionHelper.ts
 var express = require('express');
var router = express.Router();
var User = require('../app/models/user');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var config = require('../config/main'); //node expect js files. thus you don't need to write .js here
var security = require('../security/securityhelper');
var algorithm = "aes-256-ctr";
var crypto = require('crypto');
var nodeforge = require('node-forge');
var ExtractJwt = require('passport-jwt').ExtractJwt;

module.exports = {
    symmetricEncrypt: function (text, algorithm, encryptionkey) {
        var cipher = crypto.createCipher(algorithm, encryptionkey);
        var crypted = cipher.update(text, 'utf8', 'hex');
        crypted += cipher.final('hex');
        return crypted;
    },

    symmetricDecrypt: function (text, algorithm, encryptionkey) {
        var decipher = crypto.createDecipher(algorithm, encryptionkey);
        var dec = decipher.update(text, 'hex', 'utf8');
        dec += decipher.final('utf8');
        return dec;
    },

    encryptStringWithRsaPublicKey: function (textToEncrypt, publicKey) {
        var buffer = new Buffer(textToEncrypt);
        var encrypted = crypto.publicEncrypt(publicKey, buffer);
        return encrypted.toString("base64");
    },
    decryptStringWithRsaPrivateKey: function (textToDecrypt, privateKey) {
        var buffer = new Buffer(textToDecrypt, "base64");
        var decrypted = crypto.privateDecrypt(privateKey, buffer);
        return decrypted.toString("utf8");
    },
    createKeyPair: function () {
        var pair = nodeforge.pki.rsa.generateKeyPair();
        var publicKey = nodeforge.pki.publicKeyToPem(pair.publicKey);
        var privateKey = nodeforge.pki.privateKeyToPem(pair.privateKey);
        return {"privateKey": privateKey, "publicKey": publicKey};
    },

    //TODO maybe use some uid generator library i don't know... looks fine to me
    generateUUID: function () {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    },

    /**
     * TODO: implement as aspect
     * @returns {*}
     */
    getEncryptionKey: function (req) {
        var jwtFromRequest = ExtractJwt.fromAuthHeader();
        var token = jwtFromRequest(req);
        var encryptionKey = jwt.verify(token, config.secret).encKey;
        return encryptionKey;
    },

    getUsername: function (req) {
        var jwtFromRequest = ExtractJwt.fromAuthHeader();
        var token = jwtFromRequest(req);
        var username = jwt.verify(token, config.secret).email;
        return username;
    }

}
