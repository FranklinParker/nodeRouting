var express = require("express");
var unless = require("express-unless");
var extend = Object.assign;
var cors = require('cors');
var jwt = require("jsonwebtoken");


function mountAPI(app,config, model) {
  console.log(model);

  function returnError(req, res, message) {
    return function(err) {
      if (err) {
        model.logger.logAction("api", "error", req.user ? req.user.uid : "Not authenticated", {
          method: req.method,
          url: req.originalUrl,
          query: req.query,
          param: req.params,
          reason: message,
          error: err,
          stack: new Error().stack
        });
        res.status(err.statusCode || 500).send({
          // TODO: Sanitize returned message for production
          error: model.logger.sanitizeErrorObj(err),
          message: message
        });
      } else {
        return true;
      }
    };
  }

  function renderExcel(req, res) {
    return function(modelInstance) {
      if (modelInstance.augmentedData.exportData && modelInstance.augmentedData.exportData.template) {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + (modelInstance.augmentedData.exportData.fileName || "export.xlsx"));
        return exporter.generate(modelInstance.augmentedData.exportData)
          .then(function(result) {
            return res.send(new Buffer(result, 'binary'));
          });
      } else {
        return returnError(req, res, "API endpoint returned wrong response for Excel export");
      }
    };
  }

  function renderJson(res, query, getter) {
    return function(modelInstance) {
      return res.json(getter ? getter(modelInstance, query) : modelInstance);
    };
  }

  function apiHandler(api, message, getter) {
    var start = new Date();
    return function(req, res) {
      api({
          actionData: req.body || {},
          query: extend(extend({
              $method: req.method
            }, req.query || {}),
            req.params || {}),
          user: req.user,
          estimationModel: {}
        })
        .then(function(modelInstance) {
            var excelMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            model.logger.logAction("api", "DEBUG", req.user ? req.user.uid : "Not authenticated", {
              method: req.method,
              url: req.originalUrl,
              query: req.query,
              param: req.params,
              procTime: (((new Date()).getTime() - start.getTime()) / 1000).toFixed(3)
            });

            if (req.get('accept') === excelMime) {
              return renderExcel(req, res)(modelInstance);
            }
            return renderJson(res, req.query)(modelInstance);
          },
          returnError(req, res, message));
    };
  }

  router = express();


  var corsDelegate = function(req, callback) {
    console.log('corsDelegate: '+req.url);
    switch (req.url) {
      case '/getToken':
        callback(null, {
          origin: false
        });
        return false;
      default:
        if (!req.header('Origin') || !req.user) {
          console.log('cors delegate no orgin');
          callback(null, {
            origin: false
          });
          return false;
        } else {
          console.log('cors delegate orgin');
          callback(null, {
            origin: true,
            allowHeaders: ['Content-Type', 'Authorization']
          });
          //
          // var getProfileHeader = model.users.getProfileHeaderDetails({
          //   user: req.user
          // });
          // model.users.getApiClientAccessLevels(req.user.decoded.client_id)
          //   .then(function(clientApp) {
          //     return clientApp.checkAccess.call({
          //       getProfileHeader: getProfileHeader
          //     })
          //   })
          //   .then(function() {
          //     callback(null, {
          //       origin: true,
          //       allowHeaders: ['Content-Type', 'Authorization']
          //     });
          //     return true;
          //   })
          // .catch(function() {
          //   callback(null, {
          //     origin: false
          //   });
          //   return false;
          // });
        }
        return true;
    }

  };

  router.options('*', cors({
    origin: function(origin, callback) {
      console.log('origin', orgin);
      callback(null, true);
      // model.users.getApiClients().then(function(clientApps) {
      //   callback(null, clientApps.some(function(app) {
      //     return app.origin == origin
      //   }))
      // }
      // , function() {
      //   callback(null, false)
      // })
    },
    allowHeaders: ['Content-Type', 'Authorization']
  }), function(req, res) {
    res.sendStatus(200);
  });

  router.use(cors(corsDelegate), function(req, res, next) {
    console.log('router Use cors - req.header(Orgin):', req.header('Origin'));
    if (req.header('Origin')) {
      res.setHeader('Surrogate-Control', 'no-store');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    next();
  });


  var tokenCheck =
    function(req, res, next) {
      // check header or url parameters or post parameters for token
      var token = req.headers.authorization; // req.body.token ||
      // req.query.token ||
      console.log('token:', token);
      if (token) {
        jwt.verify(token, config.passport.secret, function(err, decoded) {
          if (err) {
            return res.status(403).send({
              success: false,
              message: 'Failed to authenticate token.'
            });
          } else {
            if (decoded && decoded.uid) {
              // Set user UID in the request
              req.user = {
                uid: decoded.uid
              };
              next();
            } else {
              // return an error
              return res.status(403).send({
                success: false,
                message: 'Invalid ID in token'
              });
            }
          }
        });
      } else {
        // return an error
        return res.status(403).send({
          success: false,
          message: 'Invalid token'
        });
      }
    }; // end of tokenCheck
  tokenCheck.unless = unless;


  router.use(tokenCheck.unless({path: "/getToken", useOriginalUrl:false}));

  router.get("/courses", apiHandler(model.courses.getCourses, 'get courses failed'));
  router.post("/courses", apiHandler(model.courses.addCourse, 'add course failed'));
  router.get("/courses/:courseId", apiHandler(model.courses.getCourseDetail, 'get course failed'));

  /*
   * router.get("/getToken", function(req,res) { if (req.user) { var token =
   * jwt.sign({uid:req.user.uid}, config.passport.sessionSecret, {expiresIn:
   * 24*60*60 }); // expires in 24 hours res.json({success: true,token:
   * token}); } else { res.json({success: false,token: null}); } });
   */

  return router;
}

module.exports.mountAPI = mountAPI;
