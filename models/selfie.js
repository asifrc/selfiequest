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

var deleteSelfie = function(selfieId, callback) {
  // delete from mongo
  Selfie.findByIdAndRemove(selfieId, function(err, selfie) {
    if (err) {
      callback(err);
      return;
    }
    // delete from aws
    var client = knox.createClient(config.knox.settings);
    var selfiePath = selfie.path;
    var awsFolder = config.aws.targetFolder;
    console.log(selfiePath, awsFolder); //DEV
    var fileNameAfterUrlPathMatcher = /%2F(.*)$/
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
  user.points = user.points - 1;
  user.save();
}

var tagUser = function(selfieId, owner,  taggedUserId, callback) {
  User.findById(taggedUserId, function(err, taggedUser) {
    Selfie.findById(selfieId, function(err, selfie) {
      selfie.tagged = taggedUser;
      selfie.tagText = owner.name + " & " + taggedUser.name;
      selfie.save(callback);
    });
    selfieAlreadyExists(owner._id, taggedUserId, function(err, selfieCount) {
      if (err) {
        callback(err);
        return;
      }
      if (selfieCount == 0) {
        User.findById(owner._id, function(err, user) {
          user.points += 1;
          user.save();
        });
        taggedUser.points += 1;
        taggedUser.save();
        callback(err);
      }
    });
  });
};

var selfieAlreadyExists = function(ownerId, taggedUserId, callback) {
  var criteria = [
    {owner: ownerId, tagged: taggedUserId},
    {owner: taggedUserId, tagged: ownerId}
  ];

  Selfie.count({ $or: criteria }, callback);
}

var findAllSelfies = function(callback) {
  Selfie.find({ tagText: { $ne: null } }, null, { sort: { timestamp: -1 } }, function(err, allSelfies) {
    var selfies = [];
    allSelfies.map(function(selfie) {
      if (selfie.tagged) {
        selfies.push(selfie);
      }
    })
    callback(err, selfies);
  });
};

var findSelfiePage = function(pageNumber, nPerPage, callback) {
  var pagesToSkip = pageNumber > 0 ? ((pageNumber-1)*nPerPage) : 0;
  Selfie.find({ tagText: { $ne: null } },null,
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
