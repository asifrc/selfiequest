var express = require('express');
var user = require('../models/user');
var router = express.Router();

router.get("/", function(req, res) {
  user.getAllNames(function(err, userNames) {
    var response = {
      error: err,
      data: userNames
    }
    res.contentType("application/json");
    res.send(JSON.stringify(response));
  });
});

module.exports = router;
