var router = require('express').Router();
var multiparty = require('multiparty');
var fs = require('fs');
var path = require('path')

router.post('/tag', function(req, res) {
	var form = new multiparty.Form();
	form.parse(req, function(err, fields, files) {
		var photo = files.photoFile[0];
		console.log(photo);

		var photoPath = '/photos/' + Math.random().toString().substr(2) + photo.originalFilename;
		fs.rename(photo.path, path.resolve('./public'+photoPath), function() {
			res.render('tag', { title: 'File Uploaded', imgPath: photoPath});
		});
	});

});

module.exports = router;
