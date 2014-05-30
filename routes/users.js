var express = require('express');
var user = require('../models/user');
var selfie = require('../models/selfie');
var router = express.Router();

router.get("/", function(req, res) {
  user.getFields(['name', '_id'], function(err, users) {
    var response = {
      error: err,
      data: users
    }
    res.contentType("application/json");
    res.send(JSON.stringify(response));
  });
});

router.get('/myphotos', function(req, res) {
  selfie.findAllSelfiesFor(req.session.userId, function(err, selfies) {
    res.render('gallery', {selfies: selfies});
  });
});
module.exports = router;
