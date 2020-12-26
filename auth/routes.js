'use strict';

const passport = require('passport');
const routes = require('express').Router();

const authenticateOpts = {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true,
  successFlash: 'Welcome back' 
};

routes.route('/login')
  .post(passport.authenticate('local', authenticateOpts))
  .get((req, res, next) => {
    let error_message = null;
    let message = null;
    const error = req.flash('error');
    if (error.length) error_message = error[0];
    res.render('pages/login', { error_message, message },
      (err, html) => {
        if (err) next(err);
        res.send(html);
      }
    )
  }
);

routes.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


//exports.routes = routes;
module.exports = routes;
