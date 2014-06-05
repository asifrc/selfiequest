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

module.exports = router;
