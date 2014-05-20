var router = require('express').Router();
var multiparty = require('multiparty');
var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');

var knox = require('knox');
var MultiPartUpload = require('knox-mpu');

router.post('/tag', function(req, res) {
	var form = new multiparty.Form();

	form.parse(req, function(err, fields, files) {
		var photo = files.photoFile[0];
		// console.log(photo);

    var client = knox.createClient({
      key: process.env.AWS_ACCESS_KEY_ID,
      secret: process.env.AWS_SECRET_ACCESS_KEY,
      bucket: 'selfiequestdev'
    });

		var obj = {
			client: client,
			objectName: photo.originalFilename, // Amazon S3 object name
			file: photo.path
		};
    var upload = new MultiPartUpload(obj, function(err, body) {
      if (err) {
        res.send("ERROR!!!! : " + err);
      }
      else
      {
				mongoose.connect('mongodb://localhost/selfiequest');
				var Photo = mongoose.model('Photo', { path: String });
				var photo = new Photo({ path: body.Location });
				photo.save(function(err) {
					if (err) {
						res.send("Error updating database with photo path: " + err);
					}
					else {
						res.render('tag', {imgPath: photo.path})
					}
				});
      }
    });
	});

});

module.exports = router;
