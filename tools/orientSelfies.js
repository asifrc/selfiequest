var fs = require('fs');
var gm = require('gm');

var orientPicture = function(dir, fileName) {
  gm(dir + fileName).autoOrient().write(dir + "oriented/" + fileName, function(err) {
    if (!err) {
      console.log("done");
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


var orientAllPictures = function(picDir) {
  var files = fs.readdirSync(picDir);
  Fiber(function() {
    for(var i=0; i<files.length; i++) {
      if (fs.lstatSync(picDir+files[i]).isDirectory()) {
        console.log(files[i] + " is a directory");
      }
      else {
        orientPicture(picDir, files[i]);
      }
      sleep(100);
    }
  }).run();
}

orientAllPictures("./temp/");
