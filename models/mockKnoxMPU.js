var fs = require('fs');

var config = require('../config');

var baseDir =  __dirname + "/../public/s3mock/";

//Make sure folder exists if it doesn't already
fs.exists(baseDir + config.aws.targetFolder, function(exists) {
  exists || fs.mkdir(baseDir + config.aws.targetFolder);
});

var MockMultiPartUpload = function(photoObject, callback) {
  callback = (typeof callback === "function") ? callback : function() {};
  fs.readFile(photoObject.file, function(err, data) {
    var location =  photoObject.objectName;
    var newPath = baseDir + photoObject.objectName;
    fs.writeFile(newPath, data, function(err) {
      callback(err, {Location: "/s3mock/" + location});
    });
  });
};

module.exports = MockMultiPartUpload;
