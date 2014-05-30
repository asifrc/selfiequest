var mongoose = require('mongoose');
var knox = require('knox');
var MultiPartUpload = require('knox-mpu');
var config = require('../config');

var User = require('./user').Model;


mongoose.connect(process.env.MONGO_DB);

/***************\
 * Selfie Model *
\***************/
var Selfie = mongoose.model('Selfie', {
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  path: String,
  tagged: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tagText: String,
  timestamp: { type: Date, default: Date.now }
});

// Upload selfie
var uploadPhoto = function(photo, ownerId, callback) {
  var client = knox.createClient(config.knox.settings);
  var prefix = config.aws.targetFolder + "/" + Math.round(Math.random()*10000000000000000);

  var photoObject = {
    client: client,
    objectName: prefix + photo.originalFilename, // Amazon S3 object name
    file: photo.path
  };

  var upload = new MultiPartUpload(photoObject, function(err, body) {
    if (err) {
      callback(err);
      return;
    }

    var selfie = new Selfie({ path: body.Location, owner: ownerId});
    selfie.save(function(err) {
      callback(err, selfie);
    });
  });
};

var tagUser = function(selfieId, owner,  taggedUserId, callback) {
  User.findById(taggedUserId, function(err, taggedUser) {
    Selfie.findById(selfieId, function(err, selfie) {
      selfie.tagged = taggedUser;
      selfie.tagText = owner.name + " & " + taggedUser.name
      selfie.save(callback);
    });
    taggedUser.points += 1;
    taggedUser.save();
    User.findById(owner._id, function(err, user) {
      user.points += 1;
      user.save();
    });
  });
};

var findAllSelfies = function(callback) {
  Selfie.find(callback);
};

module.exports = {
  uploadPhoto: uploadPhoto,
  tagUser: tagUser,
  findAllSelfies: findAllSelfies
};
