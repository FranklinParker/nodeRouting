var express = require('express');
var router = express.Router();
var jwt = require("jsonwebtoken");

module.exports = function(config) {


  // JWT example - issue token
  router.get("/getToken", function(req, res) {
    console.log('getToken req.user:' + JSON.stringify(req.user,null,2));
    const queryUserId = req.query ? req.query.userId : null;
    const userId = req.user || queryUserId;
    if (userId) {
      // Generate JWT - set expire to 1 day
      res.status(200).json({
        success: true,
        token: jwt.sign({
          uid: userId
        }, config.passport.secret, {
          expiresIn: 24 * 60 * 60
        })
      });

    } else {
      res.status(401).json({
        token: null
      });
    }
  });
  return router;
};
