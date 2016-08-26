var express = require('express');
app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var passport = require('passport');
var config = require('./config/main'); //node expect js files. thus you don't need to write .js here
var User = require('./app/models/user');
var jwt = require('jsonwebtoken');
var port = 3000;

//Use bodyparser to get post requests for API use
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Log request to console
app.use(morgan('dev'));

//Init passport
app.use(passport.initialize());

//connect to db
mongoose.connect(config.database); //config.database contains the url, see the file config.js

//Bring in passport strategy just defined
require('./config/passport')(passport);


//create api group routes
var apiRoutes = express.Router();
//register new users
apiRoutes.post('/register', function (req, res) {
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
apiRoutes.post('/authenticate', function (req, res) {
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
apiRoutes.get('/dashboard', passport.authenticate('jwt', {session: false}), function (req, res) {
    res.send('it worked! USer id is : '+ req.user._id+'.');//_id is autoincrement
});

//Set url for API group routes
app.use('/api', apiRoutes); // /api/dashboard etc.

//home route
app.get('/', function (req, res) {
    res.send("Relax, we will put the hp here later...");
});
app.listen(port);
console.log('your server is running on port ' + port + '.');