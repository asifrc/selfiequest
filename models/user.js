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

var getAllNamesAndIds = function(callback) {
  User.find(function(err, users) {
    if (err) {
      callback(err);
      return;
    }
    
    var userNames = [];
    users.map(function(user) {
      var userObj = {
        name: user.name,
        _id: user._id
      };
      userNames.push(userObj);
    });
    
    callback(err, userNames);
  });
};

var getAllSortedByRank = function(callback) {
  User.find(function(err, users) {
    if (err) {
      callback(err);
      return;
    }
    
    //Sort Descending
    users.sort(function(a, b) { return a.points < b.points; });
    
    callback(err, users);
  });
};

var getAllWithRank = function(callback) {
  getAllSortedByRank(function(err, users) {
    if (err) {
      callback(err);
      return;
    }
    
    users.map(function(user, rank) {
      user.rank = rank + 1;
      return user;
    });
    
    callback(err, users);
  });
};

var getRankFor = function(userId, callback) {
  getAllWithRank(function(err, users) {
    if (err) {
      callback(err);
      return;
    }
    
    var foundUser = users.reduce(function(prev, curr) {
      var foundUser = (curr._id == userId) ? curr : false;
      return prev || foundUser;
    }, false);
    
    if (!foundUser) {
      callback("User not found in getRankFor!");
      return;
    }
    
    callback(err, foundUser);
  });
};

module.exports = {
  create: create,
  findByToken: findByToken,
  getAllNamesAndIds: getAllNamesAndIds,
  getAllWithRank: getAllWithRank,
  getRankFor: getRankFor,
  Model: User
};
