var fs = require('fs');
var mongoose = require('mongoose');
var crypto = require('crypto');
var knox = require('knox');
var MultiPartUpload = require('knox-mpu');

var config = require('../config');

mongoose.connect(process.env.MONGO_DB);

var Selfie = mongoose.model('Selfie', {
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  path: String,
  thumbPath: String,
  resizedPath: String,
  tagged: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tagText: String,
  timestamp: { type: Date, default: Date.now }
});

var updateSelfie = function(selfie, callback) {
  var prefix = "https://selfiequestdev.s3.amazonaws.com/" + config.aws.targetFolder;
  console.log("Prefix:", prefix);
  console.log("Path:", selfie.path);
  var path = selfie.path;
  var fileNameMatcher = /.*%2F(.*)$/;
  var fileName = path.match(fileNameMatcher)[1];
  
  if (path.match(fileNameMatcher)[0] === "") {
    console.log("Couldn't parse line: " + path);
    callback("Couldn't parse line: " + path);
  }
  else {
    console.log("File name:", fileName);
    
    var awsThumbPath = prefix + "/thumbnails/";
    var awsResizedPath = prefix + "/resized/";
    selfie.thumbPath = awsThumbPath + fileName;
    selfie.resizedPath = awsResizedPath + fileName;
    console.log("Thumb: ", awsThumbPath);
    console.log("Resized: ", awsResizedPath);
    
    selfie.save();
    err = "";
    callback(err);
  }
};

var addAllSelfies = function(err, selfies) {
  for(var i=0; i<selfies.length; i++) {
    console.log(i);
    if (err) {
      console.log(err);
    }
    else {
      console.log(selfies[i]);
      updateSelfie(selfies[i], function(err) {
        if(err) {
          console.log(err);
        }
      });
    }
  }
}

var findAllSelfies = function(callback) {
  Selfie.find({ }, null, function(err, allSelfies) {
    var selfies = [];
    allSelfies.map(function(selfie) {
      if (selfie.tagged) {
        selfies.push(selfie);
      }
    });
    callback(err, selfies);
  });
};  
  
findAllSelfies(addAllSelfies);
