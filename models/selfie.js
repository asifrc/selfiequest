var mongoose = require('mongoose');
var knox = require('knox');
var MultiPartUpload = require('knox-mpu');


mongoose.connect(process.env.MONGO_DB);

/***************\
 * Selfie Model *
\***************/
var Selfie = mongoose.model('Selfie', { path: String, tagged: String });

var knoxSettings = {
  key: process.env.AWS_ACCESS_KEY_ID,
  secret: process.env.AWS_SECRET_ACCESS_KEY,
  bucket: 'selfiequestdev'
};

// Upload selfie
var uploadPhoto = function(photo,callback) {
  var client = knox.createClient(knoxSettings);

  var photoObject = {
    client: client,
    objectName: Math.round(Math.random()*10000000000000000) + photo.originalFilename, // Amazon S3 object name
    file: photo.path
  };

  var upload = new MultiPartUpload(photoObject, function(err, body) {
    if (err) {
      callback(err);
      return;
    }

    var selfie = new Selfie({ path: body.Location});
    selfie.save(function(err) {
      callback(err, selfie);
    });
  });
};

var tagUser = function(selfieId, userName, callback) {
  Selfie.findById(selfieId, function(err, selfie) {
    selfie.tagged = userName;
    selfie.save(callback);
  });
};

var findAllSelfies = function(callback) {
  Selfie.find(function(err, selfies) {
    callback(err, selfies);
  });
};

module.exports = {
  uploadPhoto: uploadPhoto,
  tagUser: tagUser,
  findAllSelfies: findAllSelfies
};
