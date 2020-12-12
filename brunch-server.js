'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const http = require('http');
const logger = require('morgan');
const path = require('path');
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const auth = require('./auth');

module.exports = function startServer(PORT, PATH, callback) {
  const app = express();

  // get environment variables
  const ENV = process.env.NODE_ENV || 'production'; // Assume production env. for safety
  const config = {
    development: {
      sessionSecret: 'n0xt()3D%phEEFaX'
    }
  }[ENV];

  var sessionOpts = {
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: true,
    //store: sessionStore
  };

  const server = http.createServer(app);

  // local strategy for passport authentication
  passport.use(new Strategy(
    function(username, password, cb) {
      auth.users.findByUsername(username, function(err, user) {
        if (err) { return cb(err); }
        if (!user) { return cb(null, false); }
        if (user.password != password) { return cb(null, false); }
        return cb(null, user);
      });
    }
  ));

  // Configure Passport authenticated session persistence.
  passport.serializeUser(function(user, cb) {
    cb(null, user.id);
  });

  passport.deserializeUser(function(id, cb) {
    auth.users.findById(id, function (err, user) {
      if (err) { return cb(err); }
      cb(null, user);
    });
  });


  // Middleware
  app.use(logger('combined'));
  app.use(session(sessionOpts));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(passport.initialize());
  app.use(passport.session());

  app.post('/login', 
    passport.authenticate('local'),
    function(req, res) {
      res.redirect('/');
  });

  app.get('/', function(req, res, next) {
    console.log('User', req.user);
    next();
  });

  app.use(express.static(path.join(__dirname, PATH)));

  server.listen(PORT, callback);
};
