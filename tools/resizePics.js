var fs = require('fs');
var gm = require('gm');

var resizePicture = function(dir, fileName) {
  gm(dir + fileName)
  .resize(1920, 1920 + ">")
  .write(dir + "resized/" + fileName, function(err) {
    if (!err) {
      // console.log("done");
    }
    else {
      console.log(err);
    }
  });
};

var Fiber = require('fibers');

function sleep(ms) {
    var fiber = Fiber.current;
    setTimeout(function() {
        fiber.run();
    }, ms);
    Fiber.yield();
}


var resizeAllPictures = function(picDir) {
  var files = fs.readdirSync(picDir);
  Fiber(function() {
    for(var i=0; i<files.length; i++) {
    // for(var i=0; i<2; i++) {
      if (fs.lstatSync(picDir+files[i]).isDirectory()) {
        console.log(files[i] + " is a directory");
      }
      else {
        resizePicture(picDir, files[i]);
      }
      sleep(40);
    }
  }).run();
}

resizeAllPictures("./pics/oriented/");
