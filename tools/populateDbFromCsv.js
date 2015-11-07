var mongoose = require('mongoose');
var crypto = require('crypto');
var config = require('../config');

mongoose.connect(config.mongodb.url);

var User = mongoose.model('User', {
  name: String,
  firstName: String,
  email: String,
  token: String,
  points: Number
});

var generateToken = function(key) {
  var salt = config.security.salt;
  return crypto.createHash('md5').update(key + salt).digest('hex');
};

var create = function(firstName, name, email) {
  var user = new User({ firstName: firstName, name: name, email: email });
  user.token = generateToken(email + name);
  user.points = 0;

  user.save();
};

var parseCsvLineForUserInfo = function(line) {
  var userInfoMatcher = /^([^,]*),([^,]*),([^,]*)$/;
  var userInfo = line.match(userInfoMatcher);

  if (userInfo[0] === "") {
    console.log("Couldn't parse line: " + line);
  }
  var nameAndEmail = {
    email: userInfo[1],
    firstName: userInfo[2],
    name: userInfo[2] + " " + userInfo[3]
  };

  return nameAndEmail;
};

var getAndCreateUsersFromCsvFile = function(csvFile) {
  var reader = require("buffered-reader");
  var DataReader = reader.DataReader;
  new DataReader (csvFile, { encoding: "utf8" })
    .on ("error", function (error){
        console.log ("error: " + error);
    })
    .on ("line", function (line){
        console.log ("line: " + line);
        var nameAndEmail = parseCsvLineForUserInfo(line);
        console.log(nameAndEmail);
        create(nameAndEmail.firstName, nameAndEmail.name, nameAndEmail.email);
    })
    .on ("end", function (){
        console.log ("EOF");
    })
    .read ();
};

getAndCreateUsersFromCsvFile("./tools/thoughtWorkerList.csv");
