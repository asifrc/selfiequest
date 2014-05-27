var user = require('../models/user');

var authenticate = function(req, res) {
  user.findByToken(req.params.token, function(err, currentUser) {
    if (currentUser === null) {
      res.render('auth', { message: "The token you provided is invalid. Please check your email."});
      return;
    }
    req.session.userId = currentUser._id;
    res.send("authenticate<br>USER: " + currentUser.name);
  });
};

var checkAuthentication = function(req, res, next) {
  if (typeof req.session.userId === "undefined") {
    res.render('auth', { message: "Please check your email for a link."});
    // next("AUTH FAILURE");
  }
  else {
    next();
  }
};

module.exports = {
  authenticate: authenticate,
  checkAuthentication: checkAuthentication
};
