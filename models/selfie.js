var mongoose = require('mongoose');
var knox = require('knox');
var MultiPartUpload = require('knox-mpu');
var config = require('../config');


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

var tagUser = function(selfieId, taggedUser, callback) {
  Selfie.findById(selfieId, function(err, selfie) {
    selfie.tagged = taggedUser;
    selfie.save(callback);
  });
};

var findAllSelfies = function(callback) {
  Selfie.find(function(err, selfies) {
    callback(err, selfies);
  });
};

var findAllSelfiesFor = function(user, callback) {
  Selfie.find({ $or: [{owner: user}, {tagged: user.name}] }, function(err, selfies) {
    callback(err, selfies);
  });
};

module.exports = {
  uploadPhoto: uploadPhoto,
  tagUser: tagUser,
  findAllSelfies: findAllSelfies,
  findAllSelfiesFor: findAllSelfiesFor
};
