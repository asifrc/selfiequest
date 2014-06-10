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

// var Fiber = require('fibers');
// 
// function sleep(ms) {
//     var fiber = Fiber.current;
//     setTimeout(function() {
//         fiber.run();
//     }, ms);
//     Fiber.yield();
// }
// 
// var saveAWSSelfies = function(callback) {
//   Selfie.find({ path: { $ne: null } }, null, { sort: { timestamp: -1 } }, function(err, allSelfies) {
//     var selfies = [];
//     allSelfies.map(function(selfie) {
//       // if (selfie.tagged) {
//       selfies.push(selfie);
//       // }
//     });
//     
//     var http = require('https');
//     var fs = require('graceful-fs');
//     Fiber(function() {
//       for(i=912; i<selfies.length; i++) {
//       
//         if (selfies[i] != null) {
//           var selfiePath = selfies[i].path;
//           var fileNameAfterUrlPathMatcher = /%2F(.*)$/;
//           var selfieFileName = selfiePath.match(fileNameAfterUrlPathMatcher)[1];
//           if (selfieFileName.length < 1) {
//             callback("Name of photo not found in " + selfiePath);
//             return;
//           }
//           var file = fs.createWriteStream("pics/" + selfieFileName);
//           console.log("i = "+i+". saving to pics/"+ selfieFileName + "...");
//           var request = http.get(selfiePath, function(response) {
//             response.pipe(file);
//           });
//           sleep(4000);
//         }
//       }
//     }).run();
//     callback(err);
//   });
//   
// };

module.exports = {
  deleteSelfie: deleteSelfie,
  findAllSelfies: findAllSelfies,
  findSelfiePage: findSelfiePage,
  findSelfiesFor: findSelfiesFor,
  // saveAWSSelfies: saveAWSSelfies,
  Model: Selfie
};
