var fs = require('fs');
var gm = require('gm');

var thumbnailPicture = function(dir, fileName) {
  gm(dir + fileName)
  .resize(100, 100 + "^>")
  .gravity('Center')
  .crop(100, 100)
  .write(dir + "thumbnails/" + fileName, function(err) {
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


var thumbnailAllPictures = function(picDir) {
  var files = fs.readdirSync(picDir);
  Fiber(function() {
    for(var i=0; i<files.length; i++) {
    // for(var i=0; i<2; i++) {
      if (fs.lstatSync(picDir+files[i]).isDirectory()) {
        console.log(files[i] + " is a directory");
      }
      else {
        thumbnailPicture(picDir, files[i]);
      }
      sleep(50);
    }
  }).run();
}

thumbnailAllPictures("./pics/oriented/");
