var express = require('express');
var user = require('../models/user');
var selfie = require('../models/selfie');
var router = express.Router();

router.get("/users", function(req, res) {
  user.getAllNamesAndIds(function(err, users) {
    var response = {
      error: err,
      data: users
    };
    res.contentType('application/json');
    res.send(JSON.stringify(response));
  });
});

router.get('/myPhotos', function(req, res) {
  selfie.findSelfiesFor(req.session.userId, function(err, selfies) {
    if (err) {
      res.render('error', { message: err, error: new Error(err) });
      return;
    }
    res.render('deleteSelfie', { title: "My Photos", selfies: selfies});
  });
});

module.exports = router;