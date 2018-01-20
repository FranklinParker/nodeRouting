var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');


const {getConfig} = require('./config/config');
const mountAPI = require('./index').mountAPI;

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(session({
  secret:'secret',
  saveUninitialized: false,
  resave: true
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser(function(user, done) {
	console.log('serializeUser', user);
	done(null, JSON.stringify(user));
});
passport.deserializeUser(function(obj, done) {
	console.log('deserializeUser', obj);
	done(null, JSON.parse(obj));
});

app.use('/users', users(app, passport,getConfig()));

const courses = require('./controller/courseCtrl').courses;
const appLogger = require('./logger/logger');


var model = {
  courses: courses,
  logger: appLogger
};


console.log(JSON.stringify(model, null, 2));
app.use('/api', mountAPI(app, getConfig(), model));
app.use('/', require('./routes/token')(getConfig()));
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var port = (process.env.VCAP_APP_PORT || process.env.PORT || 3000);
//Start server
var host = (process.env.VCAP_APP_HOST || '0.0.0.0');
//app.listen(port, host);
app.listen(port, host, function() {
  // print a message when the server starts listening
  console.log("server starting on https " + port);
});
module.exports = app;
