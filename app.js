var express = require('express');
var app = express();
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var config = require('./config/main'); //node expect js files. thus you don't need to write .js here
// cors is necessary for correct parsing of the data from the mongo db
var cors = require("cors");

//the next lines is to stores secure cookies
var sessions = require('client-sessions');
app.use(session({
    cookieName: 'session',
    secret: 'kldjfhklsajdklsjfd', //encrypting/decrypting data of session --> stored values cannot be looked at. Server needs this
    duration: 30*60*1000, //Amount of milliseconds until cookie expires
    activeDuration: 5*60*1000, // lengthens session
}));

var routes = require('./routes/index');
var dataRoutes = require('./routes/spirometrydata');
var consentRoutes = require('./routes/consent');


//Log request to console
app.use(morgan('dev'));
 //Init passport
app.use(passport.initialize());

//connect to db
mongoose.connect(config.database); //config.database contains the url, see the file config.js

//Bring in passport strategy just defined
require('./config/passport')(passport);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Add the routes
app.use('/', routes);
app.use('/spirometrydata', dataRoutes);
app.use('/consent', consentRoutes);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.send(err.status);
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send(
        err.message
    )    ;
});


module.exports = app;
