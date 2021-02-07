'use strict';

require('dotenv').config();

/**
 * CORS middleware for api calls. We cannot use basic auth for the location
 * /api because then the credentials will be visible (even though base64
 * envoded anyone could decode it with `atob` and then have acces to the
 * admin site. Nginx does include Access-Control-Allow-Origin do prevent
 * scripts running in a browser from another domain, however `curl` requests
  * are unprotected. I want to add a layer of security because customer data
  * would otherwise be accessible.
  *
  * @param {object} options Currently an empty object in case we need options
 */
module.exports = function (options) {
  return function (req, res, next) {
    // Implement the middleware function based on the options object
    const allowed = process.env.ALLOW_ORIGINS.split(',').map(el => el.trim());
    allowed.push(req.hostname);

    const origin = req.get('Origin'); // always set with fetch callee
    const auth = req.get('Authorization'); // will be set if logged in

    // not authenticated and no origin
    if (typeof origin === 'undefined' && typeof auth === 'undefined') {
      res.sendStatus(403); // Forbidden
      return;
    } else if (typeof auth === 'undefined') {
      if (!allowed.includes(origin.split('//')[1])) {
        res.sendStatus(403); // Forbidden
        return;
      }
    }
    _logger.info('Passed through api auth middleware');
    next();
  }
}


