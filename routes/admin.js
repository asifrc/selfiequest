var express = require('express');
var user = require('../models/user');
var selfie = require('../models/selfie');
var router = express.Router();

router.get('/dev/createUser', function(req, res) {
  res.render('createUser');
});

router.post('/dev/createUser', function(req, res) {
  user.create(req.body.name, req.body.email, function(err) {
    res.render('createUser');
  });
});

router.get('/admin/delete', function(req, res) {
  selfie.findAllSelfies(function(err, selfies) {
    if (err) {
      res.render('error', { message: err, error: new Error(err) });
      return;
    }
    res.render('deleteSelfie', { title: "Delete Selfies", selfies: selfies});
  });
});

router.post('/admin/delete', function(req, res) {
  selfie.deleteSelfie(req.body.id, function(err, result) {
    res.send(JSON.stringify({error: err}));
  });
});

module.exports = router;
