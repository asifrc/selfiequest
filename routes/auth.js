var user = require('../models/user');
var config = require('../config');

var authenticate = function(req, res) {
  user.findByToken(req.params.token, function(err, currentUser) {
    if (currentUser === null) {
      res.render('auth', { message: "The token you provided is invalid. Please check your email."});
      return;
    }
    req.session.userId = currentUser._id;
    req.session.userName = currentUser.name;
    res.redirect('/');
  });
};

var checkAuthentication = function(req, res, next) {
  if (/\/admin/.test(req.url)) {
    checkAdmin(req, res, next);
  }
  else {
    if (typeof req.session.userId === "undefined") {
      res.render('auth', { message: "Please check your email for a link."});
      // next("AUTH FAILURE");
    }
    else {
      next();
    }
  }
};

var checkAdmin = function(req, res, next) {
  if (req.method === "POST") {
    next();
  }
  else {    
    if (req.session.isAdmin) {
      next();
    }
    else {
      res.render('adminLogin', { title: "Admin Login"});
    }
  }
};

var adminLogin = function(req, res) {
  if (req.body.password === config.security.adminPassword) {
    req.session.isAdmin = true;
    res.redirect('/admin/deleteSelfie');
  }
  else {
    res.render('adminLogin', { title: "Admin Login"});
  }
}

module.exports = {
  authenticate: authenticate,
  checkAuthentication: checkAuthentication,
  checkAdmin: checkAdmin,
  adminLogin: adminLogin
};
