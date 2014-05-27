var BASE_URL = "http://localhost:3000";

casper.test.begin("User can take a selfie, tag another user, and then view the photo from the gallery", function(test) {
  casper.start(BASE_URL + "");

  casper.then(function() {
    casper.evaluate(function() {
      document.getElementById('selfieForm').sumbit();
    });
    this.fill('#selfieForm', {
      'photoFile': require('fs').workingDirectory + '/test/functional/galleryIcon.png'
    }, true);
  });

  var imageUrl = "testimage";

  casper.then(function() {
    test.assertEquals(this.currentUrl, BASE_URL + "/tag");

    imageUrl = this.evaluate(function() {
      return $('#selfiePreview').attr('src');
    });

    this.fill('#tagForm', {
      'tagged': 'Other TestUser ' + Math.round(Math.random()*10000000000000000)
    }, true);
  });

  casper.thenOpen(BASE_URL + '/gallery', function() {
    var imageExists = function(url) {
          return $('.selfiePhoto').toArray().reduce(function(prev, curr) {
            return prev || (curr.src == url);
          }, false);
      };
    test.assertTrue(this.evaluate(imageExists, imageUrl));

    var tagExists = function(tagText) {
          return $('.selfieTag').toArray().reduce(function(prev, curr) {
            return prev || (curr.textContent == tagText);
          }, false);
      };
    test.assertTrue(this.evaluate(tagExists, 'Other TestUser'));

  });

  casper.run(function() {
    test.done();
  });
});
