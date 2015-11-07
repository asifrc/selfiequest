var config = {};

var die = function(message) {
  console.error(message);
  throw new Error(message);
};
var requiredVar = function(varName) {
  return process.env[varName] || die(varName + " is missing");
}
var optionalVar = function(varName, defaultValue) {
  return process.env[varName] || defaultValue;
};

var toBool = function(val) {
  return (val.toString().toLowerCase() !== "false");
};

config.useAWS = toBool(optionalVar('USE_AWS', true));
var awsVar = (config.useAWS === true) ? requiredVar : optionalVar;

config.mongodb = {
  url: optionalVar('MONGO_DB', 'mongodb://localhost/selfiquestdev')
};
config.aws =  {
  key: awsVar('AWS_ACCESS_KEY_ID'),
  secret: awsVar('AWS_SECRET_ACCESS_KEY'),
  bucket: awsVar('AWS_S3_BUCKET'),
  targetFolder: optionalVar('AWS_FOLDER', "default"),
  environment: optionalVar('ENVIRONMENT',"dev"),
  startGame: toBool(optionalVar('START_GAME', "false"))
};
config.security = {
  salt: optionalVar('SALT', "a3jcLj3kaB"),
  adminPassword: optionalVar('ADMIN_PASSWORD', "iceland")
};
config.assets = {
  base: optionalVar('ASSET_BASE', "/").replace(/\/$/, '')
};


module.exports = config;
