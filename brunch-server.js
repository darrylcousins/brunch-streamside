'use strict';

require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const http = require('http');
const logger = require('morgan');
const path = require('path');
const passport = require('passport');
const MemoryStore = require('memorystore')(session);
const MongoClient = require('mongodb').MongoClient;
const api = require('./api');
const auth = require('./auth');
const handleError = require('./middleware/error');

module.exports = function startServer(PORT, PATH, callback) {
  const app = express();

  // get environment variables
  //const ENV = process.env.NODE_ENV || 'production'; // Assume production env. for safety

  // create mongo client connection
  let dbClient;
  let dbCollection;
  const mongo_uri = 'mongodb://localhost';

  // assign the client from MongoClient
  MongoClient
    .connect(mongo_uri, { useNewUrlParser: true, poolSize: 10, useUnifiedTopology: true })
    .then(client => {
      const db = client.db('test');
      dbClient = client;
      dbCollection = db.collection('streamside');
      // make collection available globally
      app.locals.dbCollection = dbCollection;

      // listen for the signal interruption (ctrl-c)
      process.on('SIGINT', () => {
        console.log('\nclosing dbClient');
        dbClient.close();
        process.exit();
      });

    })
    .catch(error => console.error(error));

  const server = http.createServer(app);

  auth.configurePassport();

  app.set('view engine', 'ejs');

  // session options for express session
  const sessionOpts = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
  };

  // Middleware
  //app.use(logger('combined'));
  app.use(logger('dev'));
  app.use(session(sessionOpts));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  // login/logout auth routes
  app.use('/', auth.routes);

  // db api routes
  app.use('/api', api.routes);

  // bruch compiled static files
  app.use(express.static(path.join(__dirname, PATH)));

  app.get('/*', 
    (req, res, next) => {
      //if (!req.user) return res.redirect('/login');
      res.render('pages/index', { 
        message: req.flash('success')[0],
        user: req.user
      },
        (err, html) => {
          if (err) next(err);
          res.send(html);
        }
      )
    }
  );

  app.use(handleError);

  server.listen(PORT, callback);
};
