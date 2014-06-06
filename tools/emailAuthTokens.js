var nodemailer = require("nodemailer");
var crypto = require('crypto');
var config = require('../config');
var templatesDir = ('./tools/templates');
var emailTemplates = require('email-templates');

var generateToken = function(key) {
  var salt = config.security.salt;
  return crypto.createHash('md5').update(key + salt).digest('hex');
};

var create = function(firstName, name, email) {
  var user = { firstName: firstName, name: name, email: email };
  user.token = generateToken(email + name);

  return user;
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

  user = create(nameAndEmail.firstName, nameAndEmail.name, nameAndEmail.email);

  return user;
};

var mailInfoToUsersFromCsvFile = function(csvFile) {
  // var reader = require("buffered-reader");
  // var DataReader = reader.DataReader;
  // new DataReader (csvFile, { encoding: "utf8" })
  //   .on ("error", function (error){
  //       console.log ("error: " + error);
  //   })
  //   .on ("line", function (line){
  //       var user = parseCsvLineForUserInfo(line);
  //       // user.emailToSendTo="crowshanbin@gmail.com";
  //       // console.log("sending email to: ", user)
  //       sendAuthInfoTo(user);
  //       
  //       // console.log("done!");
  //   })
  //   .on ("end", function (){
  //       console.log ("EOF");
  //   })
  //   .read ();
  
  var fs = require('fs');
  var userLines = fs.readFileSync(csvFile).toString().split("\n");
  // for(i=0; i<(userLines.length-1); i++) {

    // var user = ;
    // console.log("done with:", user);
    // sleep(5000);
  // }
  START_EMAIL = 554;
  // Increment = 10;
  // END_EMAIL = START_EMAIL + Increment - 1;
  END_EMAIL = 555;
  var sendingEmails = function(i, cb) {
    console.log("# " + i + ": '"+userLines[i]+"'");
    sendAuthInfoTo(parseCsvLineForUserInfo(userLines[i]));
    if (i<(END_EMAIL-1)) {
      setTimeout(function() { cb(i+1, cb); }, 1000);
    }
  };
  setTimeout(function() { sendingEmails(START_EMAIL, sendingEmails); }, 1000);
  
};
// 
// function sleep(ms) {
//   var start = new Date().getTime(), expire = start + ms;
//   while (new Date().getTime() < expire) { }
//   return;
// }

var sendAuthInfoTo = function(user) {
  emailTemplates(templatesDir, function(err, template) {
    if (err) {
      console.log(err);
    } else {
    var senderEmail = "crowshan@thoughtworks.com";
    var senderNameAndAddress = "Cameron Rowshanbin <crowshan@thoughtworks.com>";
    var senderPass = process.env.PASS;
    var recipient = user.email;
    var token = user.token;
    var smtpTransport = nodemailer.createTransport("SMTP",
    {
      service: "Gmail",
      secureConnection: true,
      auth: {
        user: senderEmail,
        pass: senderPass
      }
    });

    // An example users object with formatted email function
    var locals = {
      site: "https://selfiequest.herokuapp.com/",
      email: user.email,
      name: user.name,
      token: user.token
    };

    // Send a single email
    template('registration', locals, function(err, html, text) {
      if (err) {
        console.log(err);
      }
      else {
        var mailOptions = {
          from: senderNameAndAddress,
          to: recipient,
          subject: "Get Ready for Selfie Quest!!",
          generateTextFromHTML: true,
          html: html
        };
        console.log(mailOptions.to, mailOptions.from, user);
        smtpTransport.sendMail(mailOptions, function(error, response){
          if(error){
            console.log(error);
          }
        });
        }
      });
    }
  });
};

// mailInfoToUsersFromCsvFile("./tools/test.csv");
mailInfoToUsersFromCsvFile("./tools/thoughtWorkerList.csv");
// mailInfoToUsersFromCsvFile("./tools/TWListChunks/2.csv");
