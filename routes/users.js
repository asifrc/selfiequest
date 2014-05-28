var express = require('express');
var user = require('../models/user');
var router = express.Router();

router.get("/", function(req, res) {
  user.getAllNames(function(userNames) {
    res.send(JSON.stringify(userNames));
  });
});

module.exports = router;
