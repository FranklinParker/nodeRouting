var jwt = require("jsonwebtoken");
var express = require("express");
var unless = require("express-unless");
var extend = Object.assign;
var exporter = require('./excel-exporter');
var Q = require('q');
var cors = require('cors');
var jwt = require("jsonwebtoken");



function mountAPI(app, config, passport, model) {

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
          err: model.logger.sanitizeErrorObj(err),
          message: message
        });
      } else {
        return true;
      }
    }
  };

  function renderJson(res, query) {
    return function(modelInstance, getter) {
      return res.json(getter ? getter(modelInstance, query) : modelInstance.augmentedData)
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
        return returnError(req, res, "API endpoint returned wrong response for Excel export")
      }
    };
  }

  function apiHandler(api, message, getter) {
    return function(req, res) {
      var start = new Date();

      api({
          actionData: req.body || {},
          query: extend(extend({
            $method: req.method
          }, req.query || {}), req.params || {}),
          user: req.user,
          estimationModel: {}
        })
        .then(function(modelInstance) {
            model.logger.logAction("api", "DEBUG", req.user ? req.user.uid : "Not authenticated", {
              method: req.method,
              url: req.originalUrl,
              query: req.query,
              param: req.params,
              procTime: (((new Date()).getTime() - start.getTime()) / 1000).toFixed(3)
            });
            var excelMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            if (req.get('accept') === excelMime) {
              return renderExcel(req, res)(modelInstance);
            }
            return renderJson(res, req.query)(modelInstance, getter);
          },
          returnError(req, res, message))
    }
  }

  router = express();

  var corsDelegate = function(req, callback) {
    switch (req.url) {
      case '/getToken':
        callback(null, {
          origin: false
        });
        return false;
        break;
      default:
        if (!req.header('Origin') || !req.user || !req.user.decoded || !req.user.decoded.client_id) {
          callback(null, {
            origin: false
          });
          return false;
        } else {
          var getProfileHeader = model.users.getProfileHeaderDetails({
            user: req.user
          });
          model.users.getApiClientAccessLevels(req.user.decoded.client_id)
            .then(function(clientApp) {
              return clientApp.checkAccess.call({
                getProfileHeader: getProfileHeader
              })
            })
            .then(function() {
              callback(null, {
                origin: true,
                allowHeaders: ['Content-Type', 'Authorization']
              });
              return true;
            })
            .catch(function() {
              callback(null, {
                origin: false
              });
              return false;
            });
          return true;
        }

    }
  }

  router.options('*', cors({
    origin: function(origin, callback) {
      model.users.getApiClients().then(function(clientApps) {
        callback(null, clientApps.some(function(app) {
          return app.origin == origin
        }))
      }, function() {
        callback(null, false)
      })
    },
    allowHeaders: ['Content-Type', 'Authorization']
  }), function(req, res) {
    res.sendStatus(200)
  });

  router.use(cors(corsDelegate), function(req, res, next) {
    if (req.header('Origin')) {
      res.setHeader('Surrogate-Control', 'no-store')
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      res.setHeader('Pragma', 'no-cache')
      res.setHeader('Expires', '0')
    }
    next();
  });

  var tokenCheck =
    function(req, res, next) {
      // check header or url parameters or post parameters for token
      var token = req.headers['authorization']; // req.body.token ||
      // req.query.token ||
      if (token) {
        jwt.verify(token, config.passport.sessionSecret, function(err, decoded) {
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
    };
  tokenCheck.unless = unless;


  // router.use(tokenCheck.unless({path: "/getToken", useOriginalUrl:
  // false}));

  router.get("/assets", apiHandler(model.assets.getAssets, 'getAssets failed'));
  router.post("/assets", apiHandler(model.assets.addAsset, 'addAssets failed'));

  router.get("/assets/:assetId", apiHandler(model.assets.getAssetDetails, 'getAsset failed'));
  router.put("/assets/:assetId", apiHandler(model.assets.updateAssetHeader, 'updateAssetHeader failed'));
  router.put("/assets/:assetId/copy", apiHandler(model.assets.copyAsset, 'copyAsset failed'));

  router.get("/assets/:assetId/acl", apiHandler(model.assets.getAssetAccessControlList, 'getAssetAccessControlList failed'));
  router.put("/assets/:assetId/acl", apiHandler(model.assets.updateAssetAccessControlList, 'updateAssetAccessControlList failed'));

  router.get("/assets/:assetId/data", apiHandler(model.assets.getAllAssetData, 'getAllAssetData failed'));

  router.get("/assets/:assetId/estimationModel", apiHandler(model.assets.getAssetModelSummary, 'getAssetModelSummary failed'));
  router.get("/assets/:assetId/estimationModel/sections/:sectionKey", apiHandler(model.assets.getAssetModelSection, 'getAssetModelSection failed'));
  router.get("/assets/:assetId/estimationModel/collections/:collectionKey", apiHandler(model.assets.getAssetModelCollection, 'getAssetModelCollection failed'));

  router.get("/assets/:assetId/sections", apiHandler(model.assets.getAssetSections, 'getAssetSections failed'));
  router.get("/assets/:assetId/sections/:sectionKey", apiHandler(model.assets.getAssetSection, 'getAssetSection failed'));
  router.put("/assets/:assetId/sections/:sectionKey", apiHandler(model.assets.updateAssetSectionDetails, 'updateAssetSectionDetails failed'));

  router.get("/assets/:assetId/collections", apiHandler(model.assets.getAssetCollections, 'getAssetCollections failed'));
  router.get("/assets/:assetId/collections/:collectionKey", apiHandler(model.assets.getAssetCollection, 'getAssetCollection failed'), model.assets.collectionGetter("collectionKey"));
  router.put("/assets/:assetId/collections/:collectionKey", apiHandler(model.assets.updateAssetCollection, 'updateAssetCollection failed'));
  router.delete("/assets/:assetId/collections/:collectionKey", apiHandler(model.assets.deleteAssetCollection, 'deleteAssetCollection failed'));
  // API for extended queries like what-if - not supposed to change data
  router.post("/assets/:assetId/collections/:collectionKey", apiHandler(model.assets.getAssetCollection, 'getAssetCollection (POST) failed'));

  router.get("/assets/:assetId/export/:collectionKey", apiHandler(model.assets.exportAssetCollection, 'exportAssetCollection failed'));

  router.get("/users", apiHandler(model.users.getUserList, 'getUserList failed'));
  router.get("/users/groups", apiHandler(model.users.getGroupList, 'getGroupList failed'));

  router.get("/users/self", apiHandler(model.users.getProfileDetails, 'getProfileDetails failed'));
  router.put("/users/self/preferences", apiHandler(model.users.updateProfilePreferences, 'updateProfilePreferences failed'));
  router.put("/users/self/grants", apiHandler(model.users.updateUserGrants, 'updateUserGrants failed'));
  router.put("/users/self/nda", apiHandler(model.users.updateNdaStatus, 'updateNdaStatus failed'));
  router.get("/users/self/nda", apiHandler(model.users.getNdaContent, 'getNdaContent failed'));



  router.get("/estimationModels", apiHandler(model.estimationModels.getEstimationModels, 'getModels failed'));
  router.get("/estimationModels/:modelId", apiHandler(model.estimationModels.getEstimationModelHeader, 'getEstimationModelHeader failed'));

  router.get("/estimationModels/:modelId/acl", apiHandler(model.estimationModels.getModelAccessControlList, 'getModelAccessControlList failed'));
  router.put("/estimationModels/:modelId/acl", apiHandler(model.estimationModels.updateModelAccessControlList, 'updateModelAccessControlList failed'));

  router.get("/estimationModels/:modelKey/raw", apiHandler(model.estimationModels.getEstimationModelByKey, 'getEstimationModelByKey failed'));
  router.get("/estimationModels/:modelId/sections", apiHandler(model.estimationModels.getEstimationModelSections, 'getEstimationModelSections failed'));
  router.get("/estimationModels/:modelId/sections/:sectionKey/raw", apiHandler(model.estimationModels.getEstimationModelRawSection, 'getEstimationModelRawSection failed'));
  router.get("/estimationModels/:modelId/sections/:sectionKey", apiHandler(model.estimationModels.getEstimationModelSection, 'getEstimationModelSection failed'));

  router.get("/estimationModels/:modelKey/collections", apiHandler(model.estimationModels.dumpEstimationModelMasterData, 'dumpEstimationModelMasterData failed'));
  router.get("/estimationModels/:modelKey/collections/:collectionKey/raw", apiHandler(model.estimationModels.dumpEstimationModelMasterData, 'dumpEstimationModelMasterData failed'));
  router.get("/estimationModels/:modelKey/collections/:collectionKey", apiHandler(model.estimationModels.getEstimationModelMasterData, 'getEstimationModelMasterData failed'));

  router.put("/estimationModels/:modelId/sections/:sectionKey", apiHandler(model.estimationModels.updateEstimationModelSection, 'setEstimationModelSection failed'));
  router.put("/estimationModels/:modelKey/collections/:collectionKey", apiHandler(model.estimationModels.updateEstimationModelCollection, 'updateEstimationModelCollection failed'));

  router.put("/estimationModels/:modelKey/copy", apiHandler(model.estimationModels.copyEstimationModel, 'copyEstimationModel failed'));
  router.put("/estimationModels/:modelKey/clone", apiHandler(model.estimationModels.cloneEstimationModel, 'cloneEstimationModel failed'));
  router.delete("/estimationModels/:modelKey", apiHandler(model.estimationModels.deleteEstimationModel, 'deleteEstimationModel failed'));

  router.post("/estimationModels/clearCache", apiHandler(model.estimationModels.clearAllCachedData, 'EstimationModel clearCache failed'));

  router.get("/lookups", apiHandler(model.lookups.getLookups, 'getLookups failed'));
  router.get("/lookups/:lookupKey/raw", apiHandler(model.lookups.getLookupRawValues, 'getLookupRawValues failed'));
  router.get("/lookups/:lookupKey", apiHandler(model.lookups.getLookupValues, 'getLookupValues failed'));

  router.post("/log", function(req, res) {
    req.body && model.logger.logAction("client-ui", "ui-error", req.user ? req.user.uid : "Not authenticated", req.body);
    res.json({
      success: true
    })
  });

  /*
   * router.get("/getToken", function(req,res) { if (req.user) { var token =
   * jwt.sign({uid:req.user.uid}, config.passport.sessionSecret, {expiresIn:
   * 24*60*60 }); // expires in 24 hours res.json({success: true,token:
   * token}); } else { res.json({success: false,token: null}); } });
   */

  return router;
}

module.exports = mountAPI;
