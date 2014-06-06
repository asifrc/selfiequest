var express = require('express');
var user = require('../models/user');
var selfie = require('../models/selfie');
var router = express.Router();

router.get("/users", function(req, res) {
  user.getAllOtherNamesAndIds(req.session.userId, function(err, users) {
    var response = {
      error: err,
      data: users
    };
    res.contentType('application/json');
    res.send(JSON.stringify(response));
  });
});

router.get('/viewPhotos/:userID', function(req, res) {
   selfie.findSelfiesFor(req.params.userID, function(err, selfies) {
     if (err) {
       res.render('error', { message: err, error: new Error(err) });
       return;
     }
     res.render('gallery', { title: "My Photos", selfies: selfies});
   });
});

router.get('/myPhotos', function(req, res) {
  var criteria = [
    {owner: req.session.userId},
    {tagged: req.session.userId}
  ];
  var filter = {$or: criteria};
  
  selfie.findSelfiePage(filter, 0, 1, function(err, selfies) {
    if (err) {
      res.render('error', { message: err, error: new Error(err) });
      return;
    }
    console.log("in /myPhotos:", selfies, err);
    res.render('pagedDeleteSelfies', { 
      title: "My Photos", 
      selfies: selfies,
      initialPage: "/myPhotos/1"
    });
  });
});

router.get('/myPhotos/:pageNum', function(req, res) {
  var criteria = [
    {owner: req.session.userId},
    {tagged: req.session.userId}
  ];
  var filter = {$or: criteria};
  var pageNum = parseInt(req.params.pageNum);
  var selfiesPerPage = 1;
  
  selfie.findSelfiePage(filter, pageNum, selfiesPerPage, function(err, selfies) {
    nextPage = (selfies.length < selfiesPerPage) ? "" : pageNum + 1;
    console.log(selfies, "next page: ",nextPage);
    res.render('deleteSelfiePage', { title: "My Photos",
                                selfies: selfies,
                                nextPage: nextPage });
  });
});


module.exports = router;
