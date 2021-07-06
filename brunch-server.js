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
const MemoryStore = require('memorystore')(session);
const MongoClient = require('mongodb').MongoClient;

const api = require('./api');
const apiMiddleware = require('./api/middleware');
const webhooks = require('./webhooks');
const webhookMiddleware = require('./webhooks/middleware');

// make logger and env available globally
global._logger = winston;
global._env = process.env;
console.log(process.env["SO_SHOP_NAME"])

module.exports = function startServer(PORT, PATH, callback) {
  const app = express();

  // get environment variables
  //const ENV = process.env.NODE_ENV || 'production'; // Assume production env. for safety

  // create mongo client connection
  let dbClient;
  let orderCollection;
  let boxCollection;
  let todoCollection;
  let settingCollection;
  let subscriberCollection;
  const mongo_uri = 'mongodb://localhost';

  // assign the client from MongoClient
  MongoClient
    .connect(mongo_uri, { useNewUrlParser: true, poolSize: 10, useUnifiedTopology: true })
    .then(client => {
      const streamsideDB = client.db('streamside');
      orderCollection = streamsideDB.collection('orders');
      todoCollection = streamsideDB.collection('todos');
      settingCollection = streamsideDB.collection('settings');
      subscriberCollection = streamsideDB.collection('subscribers');

      if (process.env.SERVER === 'development') {
        const southbridgeDB = client.db('southbridge');
        boxCollection = southbridgeDB.collection('boxes');
      } else {
        boxCollection = streamsideDB.collection('boxes');
      };

      // make collection available globally
      app.locals.orderCollection = orderCollection;
      app.locals.boxCollection = boxCollection;
      app.locals.todoCollection = todoCollection;
      app.locals.settingCollection = settingCollection;
      app.locals.subscriberCollection = subscriberCollection;

      dbClient = client;

      // listen for the signal interruption (ctrl-c)
      process.on('SIGINT', () => {
        console.log('\nclosing dbClient');
        dbClient.close();
        process.exit();
      });

    })
    .catch(error => console.error(error));

  const server = http.createServer(app);

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

  // need raw body for verification
  app.use('/webhook', bodyParser.raw({ type: 'application/json' }))
  app.use('/webhook', webhookMiddleware({}));

  app.use(bodyParser.json());
  app.use(fileUpload());

  // db api routes - unprotected by Basic Auth but does have CORS Allow-Origin
  // header to restrict access. The middleware further hardens access from curl
  // etc
  app.use('/api', apiMiddleware({}));
  app.use('/api', api.routes);

  // shopify webhook routes - unprotected by Basic Auth, so middleware should check for shopify credentials
  app.use('/webhook', webhooks.routes);

  // brunch compiled static files
  app.use(express.static(path.join(__dirname, PATH)));

  const loadCrank = (req, res, next) => {
    //if (!req.user) return res.redirect('/login');
    res.locals.header = (PORT === 3335) ? "Streamside Organics <span class='red pl1 b'>DEV</span>" : null;
    res.render('pages/index',
      (err, html) => {
        if (err) next(err);
        res.send(html);
      }
    )
  };

  app.get('/orders', loadCrank);
  app.get('/boxes', loadCrank);
  app.get('/settings', loadCrank);
  app.get('/subscribers', loadCrank);
  app.get('/settings-plus', loadCrank); // generally unavailable to users
  app.get('/', loadCrank);

  // render 404 page
  app.use(function (req, res, next) {
    res.status(404).render('pages/notfound',
      (err, html) => {
        if (err) next(err);
        res.send(html);
      }
    )
  })

  // error handler https://www.digitalocean.com/community/tutorials/how-to-use-winston-to-log-node-js-applications
  app.use(function(err, req, res, next) {
    _logger.info('error', err);
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page - see above code for 404 to render a view
    res.locals.status = err.status || 500;
    res.status(res.locals.status);
    res.render('pages/error');
  });

  server.listen(PORT, () => {
    _logger.info(`Server started on port ${server.address().port}`);
    callback();
  });
};
