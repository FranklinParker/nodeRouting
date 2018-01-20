var express = require('express');
var router = express.Router();
var jwt = require("jsonwebtoken");

module.exports = function(config) {


  // JWT example - issue token
  router.get("/api/getToken", function(req, res) {
    const queryUserId = req.query ? req.query.userId : null;
    const userId = req.user || queryUserId;
    if (userId) {
      // Generate JWT - set expire to 1 day
      res.json({
        success: true,
        token: jwt.sign({
          uid: userId
        }, config.passport.secret, {
          expiresIn: 24 * 60 * 60
        })
      });

    } else {
      res.json({
        token: null
      });
    }
  });
  return router;
};
