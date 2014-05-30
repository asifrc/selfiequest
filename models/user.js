var mongoose = require('mongoose');
var crypto = require('crypto');
var config = require('../config');

var User = mongoose.model('User', {
  name: String,
  email: String,
  token: String
});

var generateToken = function(key) {
  var salt = config.security.salt;
  return crypto.createHash('md5').update(key + salt).digest('hex');
};

var create = function(name, email, callback) {
  var user = new User({ name: name, email: email });
  user.token = generateToken(email);
  user.points = 0;

  user.save(callback);
};

var findByToken = function(token, callback) {
  User.findOne({token: token}, callback);
};

var getAllNames = function(callback) {
  getFields('name', callback);
};

var getFields = function(fields, callback) {
  User.find(fields, callback);
};


module.exports = {
  create: create,
  findByToken: findByToken,
  getAllNames: getAllNames,
  getFields: getFields,
  Model: User
};
