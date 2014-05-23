
casper.test.begin("User can take a selfie and tag another user", function(test) {
  casper.start("http://localhost:3000");

  casper.then(function() {
    casper.evaluate(function() {
      document.getElementById('selfieForm').sumbit();
    });
    this.fill('#selfieForm', {
      'photoFile': require('fs').workingDirectory + '/test/functional/galleryIcon.png'
    }, true);
  });

  casper.then(function() {
    test.assertEquals(this.currentUrl, "http://localhost:3000/tag")

    this.fill('#tagForm', {
      'tagged': 'Other TestUser'
    }, true);
  });

  casper.then(function() {
    test.assertEquals(this.currentUrl, "http://localhost:3000/")
  })

  casper.run(function() {
    test.done();
  });
});
