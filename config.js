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

module.exports = {
  aws: {
    key: requiredVar('AWS_ACCESS_KEY_ID'),
    secret: requiredVar('AWS_SECRET_ACCESS_KEY'),
    bucket: requiredVar('AWS_S3_BUCKET'),
    targetFolder: optionalVar('AWS_FOLDER', "default"),
    environment: optionalVar('ENVIRONMENT',"dev"),
    startGame: optionalVar('START_GAME', "false")
  },
  security: {
    salt: optionalVar('SALT', "a3jcLj3kaB"),
    adminPassword: optionalVar('ADMIN_PASSWORD', "iceland")
  }
};
