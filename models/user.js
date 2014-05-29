var mongoose = require('mongoose');
var crypto = require('crypto');
var config = require('../config');

var User;
var UserSchema = mongoose.Schema({
  name: String,
  email: String,
  token: String,
  points: Number
});
var selfies = require('./selfie').findAllSelfies(function(err, selfies) {
  UserSchema.virtual('pointss').get(function() {
    return selfies.reduce(function(prev, curr) {
      var points = (curr.owner === this._id || curr.tagged === this.name) ? 1 : 0;
      return prev + points;
    }, 0);
  });
  User = mongoose.model('User', UserSchema);
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
