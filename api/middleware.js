'use strict';

require('dotenv').config();

module.exports = function (options) {
  return function (req, res, next) {
    // Implement the middleware function based on the options object
    _logger.info('running through api auth middleware');
    _logger.info(process.env.SHOPIFY_WEBHOOK_KEY);
    _logger.info(req.get('X-Shopify-Hmac-SHA256'));
    next();
  }
}


