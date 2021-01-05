'use strict';

const fs = require('fs');

exports.orderCreated = async function (req, res, next) {
  console.log(req.headers);
  console.log(req.body);
  fs.writeFile(new Date().getTime().toString(), JSON.stringify(req.body, null, 2), function (err) {
      if (err) throw err;
      console.log('Saved!');
  });
  res.status(200).json({ success: 'order created webhook received' });
};

