const config = require('./config.json');


var getConfig = () => {
  console.log('process.env.SSO_SECRET:' + process.env.SSO_SECRET);
  if (process.env.SSO_SECRET) {
    config.passport.secret = process.env.SSO_SECRET;
  }
  return config;
};

module.exports= {getConfig};
