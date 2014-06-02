var express = require('express');
var router = express.Router();

var User = require('../models/user');

var getOrdinal = function(n) {
   var s=["th","st","nd","rd"],
       v=n%100;
   return n+(s[(v-20)%10]||s[v]||s[0]);
}

/* GET home page. */
router.get('/', function(req, res) {
  User.getRankFor(req.session.userId, function(err, rankedUser) {
    if (err) {
      res.render('error', { message: err, error: new Error(err) });
      return;
    }
    
    var user = {
      name: rankedUser.name,
      place: getOrdinal(rankedUser.rank),
      points: rankedUser.points + " point"
    }
    user.points += (rankedUser.points != 1) ? "s" : "";
    
    res.render('index', { title: 'Selfie Quest', user: user });    
  });
});

module.exports = router;
