'use strict';

const passport = require('passport');
const Strategy = require('passport-local').Strategy;

const routes = require('./routes');
const users = require('./users');

exports.routes = routes;

// configure passport
exports.configurePassport = function () {

  // local strategy for passport authentication
  passport.use(new Strategy(
    (username, password, done) => {
      users.findByUsername(username, (err, user) => {
        if (err) return done(err);
        if (!user) return done(null, false);
        if (user.password != password) return done(null, false);
        return done(null, user);
      });
    }
  ));

  // Configure Passport authenticated session persistence.
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    users.findById(id, (err, user) => {
      if (err) { return done(err); }
      done(null, user);
    });
  });

};

