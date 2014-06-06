var express = require('express');
var user = require('../models/user');
var selfie = require('../models/selfie');
var router = express.Router();

router.get('/createUser', function(req, res) {
  res.render('createUser');
});

router.post('/createUser', function(req, res) {
  user.create(req.body.firstName, req.body.lastName, req.body.email, function(err) {
    res.render('createUser');
  });
});

router.get('/deleteSelfie', function(req, res) {
  selfie.findSelfiePage({}, 0, 1, function(err, selfies) {
    if (err) {
      res.render('error', { message: err, error: new Error(err) });
      return;
    }
    console.log(selfies);
    res.render('pagedDeleteSelfies', { 
      title: "Delete Selfies", 
      selfies: selfies,
      initialPage: "deleteSelfie/1"
    });
  });
});

router.get('/deleteSelfie/:pageNum', function(req, res) {
  console.log("got here!");
  var pageNum = parseInt(req.params.pageNum);
  var selfiesPerPage = 1;
  
  selfie.findSelfiePage({}, pageNum, selfiesPerPage, function(err, selfies) {
    nextPage = (selfies.length < selfiesPerPage) ? "" : pageNum + 1;
    console.log(selfies, "next page: ",nextPage);
    res.render('deleteSelfiePage', { title: "Delete Selfies",
                                selfies: selfies,
                                nextPage: nextPage });
  });
});

module.exports = router;
