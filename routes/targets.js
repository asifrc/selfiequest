var express = require('express');
var user = require('../models/user');
var selfie = require('../models/selfie');
var target = require('../models/target');
var router = express.Router();

router.get('/new', function(req, res) {
  target.generateNextTarget(req.session.userId, function(err) {
    res.send("done!");
  });
});

router.get('/kill', function(req, res) {
  target.eliminateTarget(req.session.userId, "53900e4cd9113c0f40d6293d", function(err, points) {
    points = points || 10
    res.send("Target Eliminated! " + points + " points to Gryffindor!");
  });
});

module.exports = router;
