var router = require('express').Router();
var fs = require('fs');
var path = require('path');
var multiparty = require('multiparty');

var selfie = require('../models/selfie');

router.post('/tag', function(req, res) {
	var form = new multiparty.Form();

	form.parse(req, function(err, fields, files) {
		var photo = files.photoFile[0];

		selfie.uploadPhoto(photo, req.session.userId, function(err, selfie) {
			if (err) {
				res.render('error', {error: err});
				return;
			}
			req.session.selfieId = selfie._id;
			res.render('tag', {imgPath: selfie.path});
		});
	});
});

router.post('/save', function(req, res) {
	selfie.tagUser(req.session.selfieId, req.body.tagged, function(err) {
		if (err) {
			res.render('err', {error: err});
			return;
		}
		res.redirect('/');
	});
});

router.get('/gallery', function(req, res) {
	selfie.findAllSelfies(function(err, selfies) {
		res.render('gallery', { title: "Photo Gallery", selfies: selfies});
	});
});

module.exports = router;
