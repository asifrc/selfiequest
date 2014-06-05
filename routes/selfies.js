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

router.post('/deleteSelfie', function(req, res) {
  selfie.deleteSelfie(req.body.id, function(err, result) {
    res.send(JSON.stringify({error: err}));
  });
});

router.post('/save', function(req, res) {
	var owner =  {
		name: req.session.userName,
		_id: req.session.userId
	};
	selfie.tagUser(req.session.selfieId, owner, req.body.tagged, function(err) {
		if (err) {
			res.render('err', {error: err});
			return;
		}
		res.redirect('/');
	});
});

router.get('/gallery', function(req, res) {
	selfie.findSelfiePage(0, 1, function(err, selfies) {
		res.render('pagedGallery', {
			title: "Photo Gallery",
			selfies: selfies,
			initialPage: "/gallery/1"
		});
	});
});

router.get('/gallery/:pageNum', function(req, res) {
	var pageNum = parseInt(req.params.pageNum);
	var selfiesPerPage = 1;
	selfie.findSelfiePage({}, pageNum, selfiesPerPage, function(err, selfies) {
		nextPage = (selfies.length < selfiesPerPage) ? "" : pageNum + 1;
		res.render('galleryPage', { title: "Photo Gallery",
																selfies: selfies,
																nextPage: nextPage });
	});
});

router.get('/userGallery/:userId', function(req, res) {
	selfie.findSelfiePage({}, 0, 1, function(err, selfies) {
		res.render('pagedGallery', {
			title: "Photo Gallery",
			selfies: selfies,
			initialPage: "/userGallery/" + req.params.userId + "/1"
		});
	});
});


router.get('/userGallery/:userId/:pageNum', function(req, res) {
	var pageNum = parseInt(req.params.pageNum);
	var selfiesPerPage = 1;
	var criteria = [
		{owner: req.params.userId},
		{tagged: req.params.userId}
	];

	var filter = { $or: criteria }
	selfie.findSelfiePage(filter, pageNum, selfiesPerPage, function(err, selfies) {
		nextPage = (selfies.length < selfiesPerPage) ? "" : pageNum + 1;
		res.render('galleryPage', { title: "Photo Gallery",
																selfies: selfies,
																nextPage: nextPage });
	});
});


module.exports = router;
