var express = require('express');
var user = require('../models/user');
var router = express.Router();

router.get("/", function(req, res) {
  user.getAllNamesAndIds(function(err, users) {
    var response = {
      error: err,
      data: users
    }
    res.contentType("application/json");
    res.send(JSON.stringify(response));
  });
});

module.exports = router;
