var mongoose = require('mongoose');
var config = require('../config');

var knox = config.useAWS ? require('knox') : require('./mockKnox');
var MultiPartUpload = config.useAWS ? require('knox-mpu') : require('./mockKnoxMPU');

var User = require('./user').Model;

var knoxSettings = {
  key: config.aws.key,
  secret: config.aws.secret,
  bucket: config.aws.bucket
}

mongoose.connect(config.mongodb.url);

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
  var client = knox.createClient(knoxSettings);
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

    var s3Url = "selfiequestdev.s3.amazonaws.com";
    var cdnUrl = "d1wb2yrm48p5uh.cloudfront.net";

    var selfie = new Selfie({ path: body.Location, owner: ownerId});
    selfie.path = selfie.path.replace(s3Url, cdnUrl);
    selfie.save(function(err) {
      callback(err, selfie);
    });
  });
};

var deleteSelfie = function(selfieId, callback) {
  // delete from mongo
  Selfie.findByIdAndRemove(selfieId, function(err, selfie) {
    if (err) {
      callback(err);
      return;
    }
    // delete from aws
    var client = knox.createClient(knoxSettings);
    var selfiePath = selfie.path;
    var awsFolder = config.aws.targetFolder;
    console.log(selfiePath, awsFolder); //DEV
    var fileNameAfterUrlPathMatcher = /%2F(.*)$/;
    var selfieFileName = selfiePath.match(fileNameAfterUrlPathMatcher)[1];
    if (selfieFileName.length < 1) {
      callback("Name of photo not found in " + selfiePath);
      return;
    }

    console.log('client.deletefile: ' + awsFolder + selfieFileName);
    client.deleteFile(awsFolder + '/' +selfieFileName, function(err, res) {
      if (err) {
        console.log("KNOX ERROR: ", err);
      }
      else {
        console.log("DELETE SUCCESS");
      }
    });

    // remove points
    User.findById(selfie.owner, removePointsFrom);
    User.findById(selfie.tagged, removePointsFrom);

    callback(err);

  });

};

var removePointsFrom = function(err, user) {
  if (err) {
    console.log("ERROR: Unable to fetch user in removePointsFrom");
    return;
  }
  user.points = user.points - 10;
  user.save();
};

var tagUser = function(selfieId, owner,  taggedUserId, callback) {
  User.findById(taggedUserId, function(err, taggedUser) {
    Selfie.findById(selfieId, function(err, selfie) {
      selfie.tagged = taggedUser;
      selfie.tagText = owner.name + " & " + taggedUser.name;
      selfie.save(function(err) {
        if (err) {
          return callback(err);
        }
        else {
          selfieAlreadyExists(owner._id, taggedUserId, function(err, selfieCount) {
            if (err) {
              return callback(err);
            }
            if (selfieCount <= 1) {
              User.findById(owner._id, function(err, user) {
                user.points += 10;
                user.save();
              });
              taggedUser.points += 10;
              taggedUser.save();
              callback(err);
            }
            else {
              callback();
            }
          });
        }
      });
    });
  });
};

var selfieAlreadyExists = function(ownerId, taggedUserId, callback) {
  var criteria = [
    {owner: ownerId, tagged: taggedUserId},
    {owner: taggedUserId, tagged: ownerId}
  ];

  Selfie.count({ $or: criteria }, callback);
};

var findAllSelfies = function(callback) {
  Selfie.find({ tagText: { $ne: null } }, null, { sort: { timestamp: -1 } }, function(err, allSelfies) {
    var selfies = [];
    allSelfies.map(function(selfie) {
      if (selfie.tagged) {
        selfies.push(selfie);
      }
    });
    callback(err, selfies);
  });
};

var findSelfiePage = function(filter, pageNumber, nPerPage, callback) {
  var pagesToSkip = pageNumber > 0 ? ((pageNumber-1)*nPerPage) : 0;
  filter.tagText = { $ne: null };
  Selfie.find(filter,null,
    {
      skip: pagesToSkip,
      limit: nPerPage,
      sort: {
        timestamp: -1
      }
    },
    callback);
};

var findSelfiesFor = function(userId, callback) {
  var criteria = [
    {owner: userId},
    {tagged: userId}
  ];
  Selfie.find({ $or: criteria, tagText: { $ne: null } }, null, { sort: { timestamp: -1 } },callback);
};

module.exports = {
  uploadPhoto: uploadPhoto,
  deleteSelfie: deleteSelfie,
  tagUser: tagUser,
  findAllSelfies: findAllSelfies,
  findSelfiePage: findSelfiePage,
  findSelfiesFor: findSelfiesFor,
  Model: Selfie
};
