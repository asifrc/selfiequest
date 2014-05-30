var BASE_URL = "http://localhost:3000";

casper.test.begin("User can take a selfie, tag another user, and then view the photo from the gallery", function(test) {
  var testUser = {
    'name': "Michelle",
    'email': "michelle@example.com"
  };
  var token = "fe4788dd07a506e5c4c662e636dc3f46";

  casper.start(BASE_URL + "/dev/createUser");

  //Create a new User
  casper.then(function() {
    this.fill('#createUserForm', testUser, true);
  });

  casper.thenOpen(BASE_URL + "/auth/" + token, function() {
    test.assertFalse(this.exists('#errorMessage'));
  });

  casper.thenOpen(BASE_URL + '/', function() {
    casper.evaluate(function() {
      document.getElementById('selfieForm').sumbit();
    });
    this.fill('#selfieForm', {
      'photoFile': require('fs').workingDirectory + '/test/functional/galleryIcon.png'
    }, true);
  });

  var imageUrl = "testimage";
  var taggedUserId;
  var taggedUserName;

  casper.then(function() {
    test.assertEquals(this.currentUrl, BASE_URL + "/tag");

    imageUrl = this.evaluate(function() {
      return $('#selfiePreview').attr('src');
    });

    taggedUserId = this.evaluate(function() {
      return $('ul li a').first().attr('data-value');
    });

    taggedUserName = this.evaluate(function() {
      return $('ul li a').first().html();
    });

    this.fill('#tagForm', {
      'tagged':  taggedUserId
    }, true);
  });

  casper.thenOpen(BASE_URL + '/gallery');

  casper.then(function() {
    test.assertEquals(this.currentUrl, BASE_URL + "/gallery");
    this.wait(2000);
    console.log(this.getHTML());
    var imageExists = function(url) {
      return $('.selfiePhoto').toArray().reduce(function(prev, curr) {
        return prev || (curr.src == url);
      }, false);
    };

    test.assertTrue(this.evaluate(imageExists, imageUrl));

    var tagExists = function(tagText) {
          return $('.selfieTag').toArray().reduce(function(prev, curr) {
            return prev || (curr.textContent.indexOf(tagText) > -1);
          }, false);
      };
    test.assertTrue(this.evaluate(tagExists, taggedUserName));

  });

  casper.run(function() {
    test.done();
  });
});
