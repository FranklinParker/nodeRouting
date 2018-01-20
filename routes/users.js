var express = require('express');
var LocalStrategy = require('passport-local').Strategy;
var jwt = require("jsonwebtoken");


var router = express.Router();
const users = [{
  userName: 'fparker',
  name: 'Franklin Parker',
  password: 'ibm'
}];

module.exports = function(app, passport,config) {

  router.get('/', function(req, res, next) {
    res.send('respond with a resource');
  });


  router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) {
        return res.status(401).send({
          result:'failed',
          message: 'authentication failed'
        }); // will generate a 500 error
      }
      // Generate a JSON response reflecting authentication status
      if (!user) {
        return res.status(401).send({
          result:'failed',
          message: 'authentication failed'
        });
      }

      req.login(user, loginErr => {
        if (loginErr) {
          return next(loginErr);
        }
        return res.status(200).send({
          result:'success',
          name: user.name,
          message: 'authentication succeeded',
          token: jwt.sign({
            uid: user.user
          }, config.passport.secret, {
            expiresIn: 24 * 60 * 60
          })
        });
      });
    })(req, res, next);
  });


  router.get('/login', function(req, res, next) {
    req.render('index');
  });

  passport.use(new LocalStrategy(function(username, password, done) {
    getUserByUsername(username, function(user) {
      if (!user) {
        return done(null, false, {
          message: 'Unknown User'
        });
      }
      if (password === user.password) {
        return done(null, {user:user.userName, name:user.name});
      } else {
        return done('error logging in');
      }
    });
  }));


  return router;
}


function getUserByUsername(userName, callback) {
  const user = users.find(user => user.userName === userName);
  callback(user);
}
