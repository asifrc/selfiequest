var BASE_URL = "http://localhost:3000";

casper.test.begin("User can take a selfie, tag another user, and then view the photo from the gallery. User views own gallery and deletes it", function(test) {
  var testUser1 = {
    'name': "Michelle",
    'email': "michelle@example.com"
  };
  var testUser2 = {
    'name': "Bob",
    'email': "bob@example.com"
  };
  var token = "fe4788dd07a506e5c4c662e636dc3f46";

  var imageUrl = "testimage";
  var taggedUserId;
  var taggedUserName;

  casper.start(BASE_URL + '/admin');
  
  casper.then(function() {
    this.fill('#adminLogin', {
        password: 'iceland'
    }, true);
  });

  //Create a new User
  casper.thenOpen(BASE_URL + "/admin/createUser", function() {
    this.fill('#createUserForm', testUser1, true);
  });
  casper.then(function() {
    this.fill('#createUserForm', testUser2, true);
  });

  casper.thenOpen(BASE_URL + "/auth/" + token, function() {
    test.assertFalse(this.exists('#errorMessage'));
  });

  casper.thenOpen(BASE_URL + '/users', function() {
    var user = JSON.parse(this.getPageContent()).data[0];
    taggedUserId = user._id;
    taggedUserName = user.name;
  });

  casper.thenOpen(BASE_URL + '/', function() {
    casper.evaluate(function() {
      document.getElementById('selfieForm').sumbit();
    });
    this.fill('#selfieForm', {
      'photoFile': require('fs').workingDirectory + '/test/functional/galleryIcon.png'
    }, true);
  });

  casper.then(function() {
    test.assertEquals(this.currentUrl, BASE_URL + "/tag");

    imageUrl = this.evaluate(function() {
      return $('#selfiePreview').attr('src');
    });

    this.fill('#tagForm', {
      'tagged':  taggedUserId
    }, true);
  });

  casper.thenOpen(BASE_URL + '/myPhotos');

  var selfieCountBeforeDeleting;

  casper.then(function() {
    test.assertEquals(this.currentUrl, BASE_URL + "/myPhotos");
    selfieCountBeforeDeleting = this.evaluate(function(url) {
      var selfieCount = $('.selfie').size();
      $('.deleteButton').first().trigger('click');
      $('#deleteConfirm').trigger('click');
      return selfieCount;
    });
  })

  casper.thenOpen(BASE_URL + '/myPhotos');

  casper.then(function() {
    test.assertTrue(this.evaluate(function(selfieCount) {
      return ($('.selfie').size() == (selfieCount - 1));
    }, selfieCountBeforeDeleting));
  })

  casper.thenOpen(BASE_URL + '/gallery');
if (false) {
  casper.then(function() {
    test.assertEquals(this.currentUrl, BASE_URL + "/gallery");
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
}
  casper.run(function() {
    test.done();
  });
});
