var mongoose = require('mongoose');
var multiparty = require('multiparty');
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
var uploadPhoto = function(req, res) {
  var form = new multiparty.Form();

  form.parse(req, function(err, fields, files) {
    var selfie = files.photoFile[0];

    var client = knox.createClient(knoxSettings);

    var obj = {
      client: client,
      objectName: selfie.originalFilename, // Amazon S3 object name
      file: selfie.path
    };
    var upload = new MultiPartUpload(obj, function(err, body) {
      if (err) {
        res.send("ERROR!!!! : " + err);
      }
      else
      {
        var selfie = new Selfie({ path: body.Location});
        selfie.save(function(err) {
          if (err) {
            res.send("Error updating database with selfie path: " + err);
          }
          else {
            req.session.selfieId = selfie._id;
            res.render('tag', {imgPath: selfie.path})
          }
        });
      }
    });
  });
}

var tagUser = function(req, res) {
  Selfie.findById(req.session.selfieId, function(err, selfie) {
    if (err) {
      res.send("Error updating database with tagged1: " + err);
    }
    else {
      selfie.tagged = req.body.tagged;
      selfie.save(function(err) {
        if (err) {
          res.send("Error updating database with tagged: " + err);
        }
        res.redirect('/');
      });
    }
  });
}

var displayGallery = function(req, res) {
  Selfie.find(function(err, selfies) {
    res.render('gallery', { title: "Photo Gallery", selfies: selfies});
  })
};

module.exports = {
  uploadPhoto: uploadPhoto,
  tagUser: tagUser,
  displayGallery: displayGallery
};
