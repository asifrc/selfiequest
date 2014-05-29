var mongoose = require('mongoose');
var crypto = require('crypto');
var config = require('../config');

var User = mongoose.model('User', {name: String, email: String, token: String, points: Number});

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
  User.find(function(err, users) {
    if (err) {
      callback(err);
      return;
    }
    var userNames = [];
    users.map(function(user) {
      userNames.push(user.name);
    });
    callback(err, userNames);
  });
};

module.exports = {
  create: create,
  findByToken: findByToken,
  getAllNames: getAllNames
};
