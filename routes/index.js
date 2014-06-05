var express = require('express');
var router = express.Router();

var User = require('../models/user');

var getOrdinal = function(n) {
   var s=["th","st","nd","rd"],
       v=n%100;
   return n+(s[(v-20)%10]||s[v]||s[0]);
};

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
    };
    user.points += (rankedUser.points != 1) ? "s" : "";
    
    res.render('index', { title: 'Selfie Quest', user: user });    
  });
});

router.get('/leaderboard', function(req, res) {
  var you = false;
  User.getAllWithRank(function(err, users) {
    if (err) {
      res.render('error', { message: err, error: new Error(err) });
      return;
    }
    
    users.map(function(user) {
      if (user._id == req.session.userId) {
        user.name = "You";
        you = user;
      }
    });
    res.render('leaderboard', { title: "Leaderboard", users: users, you: you });
  });
});


module.exports = router;
