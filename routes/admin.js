var express = require('express');
var user = require('../models/user');
var selfie = require('../models/selfie');
var router = express.Router();

router.get('/createUser', function(req, res) {
  res.render('createUser');
});

router.post('/createUser', function(req, res) {
  user.create(req.body.firstName, req.body.lastName, req.body.email, function(err) {
    res.render('createUser');
  });
});

router.get('/deleteSelfie', function(req, res) {
  selfie.findAllSelfies(function(err, selfies) {
    if (err) {
      res.render('error', { message: err, error: new Error(err) });
      return;
    }
    res.render('deleteSelfie', { title: "Delete Selfies", selfies: selfies});
  });
});

module.exports = router;
