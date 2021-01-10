'use strict';

require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const fileUpload = require('express-fileupload');
const http = require('http');
const morgan = require('morgan'); // http request logger
const winston = require('./winston-config'); // logger
const path = require('path');
const passport = require('passport');
const MemoryStore = require('memorystore')(session);
const MongoClient = require('mongodb').MongoClient;

const api = require('./api');
const webhooks = require('./webhooks');
const auth = require('./auth');

// make logger available globally
global._logger = winston;

module.exports = function startServer(PORT, PATH, callback) {
  const app = express();

  // get environment variables
  //const ENV = process.env.NODE_ENV || 'production'; // Assume production env. for safety

  // create mongo client connection
  let dbClient;
  let orderCollection;
  let boxCollection;
  const mongo_uri = 'mongodb://localhost';

  // assign the client from MongoClient
  MongoClient
    .connect(mongo_uri, { useNewUrlParser: true, poolSize: 10, useUnifiedTopology: true })
    .then(client => {
      const db = client.db('streamside');
      dbClient = client;
      orderCollection = db.collection('orders');
      boxCollection = db.collection('boxes');

      // make collection available globally
      app.locals.orderCollection = orderCollection;
      app.locals.boxCollection = boxCollection;

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

  // templating
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
  //app.use(morgan('combined', { stream: winston.stream })); // standard Apache log format with ip, user-agent etc
  app.use(morgan('dev', { stream: winston.stream })); // simple
  //app.use(morgan('dev')); // simple
  app.use(session(sessionOpts));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(fileUpload());
    /*
  app.use(fileUpload({ // be sure to delete temp files
    useTempFiles : true, // but prevents memory overload with large files
    tempFileDir : path.join(__dirname,'tmp'),
  }));
  */
  app.use(flash());

  // login/logout auth routes
  app.use('/', auth.routes);

  // db api routes
  app.use('/api', api.routes);

  // shopify webhook routes
  app.use('/webhook', webhooks.routes);

  // brunch compiled static files
  app.use(express.static(path.join(__dirname, PATH)));

  const loadCrank = (req, res, next) => {
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
  };

  app.get('/orders', loadCrank);
  app.get('/boxes', loadCrank);
  app.get('/', loadCrank);

  // render 404 page
  app.use(function (req, res, next) {
    res.status(404).render('pages/404', {user: null},
      (err, html) => {
        if (err) next(err);
        res.send(html);
      }
    )
  })

  // app.use(handleError); // first error handler - now using that below

  // error handler https://www.digitalocean.com/community/tutorials/how-to-use-winston-to-log-node-js-applications
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page - see above code for 404 to render a view
    res.status(err.status || 500);
    res.render('error');
  });

  server.listen(PORT, callback);
};
