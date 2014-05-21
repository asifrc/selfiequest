var router = require('express').Router();
var fs = require('fs');
var path = require('path');

var selfie = require('../models/selfie')

router.post('/tag', function(req, res) {
	selfie.uploadPhoto(req, res);
});

module.exports = router;
