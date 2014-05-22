
casper.test.begin("User can take a selfie and goes to the tag page", function(test) {
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
  });

  casper.run(function() {
    test.done();
  });
});
