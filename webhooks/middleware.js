'use strict';

require('dotenv').config();
const crypto = require('crypto');

/**
 * Verify that the request comes from shopify
  *
  * @param {object} options Currently an empty object in case we need options
 */
module.exports = function (options) {
  return async function (req, res, next) {
    // Implement the middleware function based on the options object

    const secret = process.env.WEBHOOK_KEY;
    const hmac = req.get('X-Shopify-Hmac-SHA256');

    const hash = crypto
      .createHmac('sha256', secret)
      .update(req.body, 'utf8', 'hex')
      .digest('base64')

    if (hash === hmac) {
      _logger.info('Passed webhook auth middleware');
      next();
    } else {
      _logger.info('Failed webhook auth middleware');
      res.sendStatus(403);
    }
  }
}


