var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  var user = {
    name: req.session.userName
  }
  res.render('index', { title: 'Selfie Quest', user: user });
});

module.exports = router;
