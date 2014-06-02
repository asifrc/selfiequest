var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  var user = {
    name: req.session.userName,
    place: "4th",
    points: 250
  }
  res.render('index', { title: 'Selfie Quest', user: user });
});

module.exports = router;
