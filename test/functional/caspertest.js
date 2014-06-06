var BASE_URL = "http://localhost:3000";

casper.test.begin("User can take a selfie, tag another user, and then view the photo from the gallery. User views own gallery and deletes it", function(test) {
  var testUser1 = {
    'firstName': "Michelle",
    'lastName': "Smith",
    'email': "michelle@example.com"
  };
  var testUser2 = {
    'firstName': "Bob",
    'lastName': "Barker",
    'email': "bob@example.com"
  };
  var token = "c33d0558ea0215a4572c7f26185bbc24";

  var imageUrl = "testimage";
  var taggedUserId;
  var taggedUserName;

/*
  Bypass the blocked page
*/
  casper.start(BASE_URL + '/unblock');

/*
  Log in as Admin
*/
  casper.thenOpen(BASE_URL + '/admin');

  casper.then(function() {
    this.fill('#adminLogin', {
        password: 'iceland'
    }, true);
  });

/*
  Create Michelle and Bob as users
*/
  casper.thenOpen(BASE_URL + "/admin/createUser", function() {
    this.fill('#createUserForm', testUser1, true);
  });
  casper.then(function() {
    this.fill('#createUserForm', testUser2, true);
  });

/*
  Log in as Michelle
*/
  casper.thenOpen(BASE_URL + "/auth/" + token, function() {
    test.assertFalse(this.exists('#errorMessage'));
  });

/*
  Decide Who I want to take a selfie with
*/
  casper.thenOpen(BASE_URL + '/users', function() {
    var user = JSON.parse(this.getPageContent()).data[0];
    taggedUserId = user._id;
    taggedUserName = user.name;
  });

/*
  Take a selfie
*/
  casper.thenOpen(BASE_URL + '/', function() {
    this.fill('#selfieForm', {
      'photoFile': require('fs').workingDirectory + '/test/functional/galleryIcon.png'
    }, true);
  });

/*
  Tag another person
*/
  casper.then(function() {
    test.assertEquals(this.currentUrl, BASE_URL + "/tag");

    imageUrl = this.evaluate(function() {
      return $('#selfiePreview').attr('src');
    });

    this.fill('#tagForm', {
      'tagged':  taggedUserId
    }, true);
  });

/*
  See that my photo uploaded and we're tagged properly
*/
casper.thenOpen(BASE_URL + "/gallery/1", function() {
  test.assertEquals(this.currentUrl, BASE_URL + "/gallery/1");
  var imageExists = function(url) {
    var photos = document.getElementsByClassName('selfiePhoto');
    if (photos.length > 0) {
      return (photos[0].src === url);
    }
    else {
      false;
    }
  };

  test.assertTrue(this.evaluate(imageExists, imageUrl));

  var tagExists = function(tagText) {
    var tags = document.getElementsByClassName('selfieTag');
    if (tags.length > 0) {
      return (tags[0].innerHTML.indexOf(tagText) > -1);
    }
    else {
      false;
    }
    test.assertTrue(this.evaluate(tagExists, taggedUserName));
  };

});

/*
  Delete my photo
*/

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
  });

/*
  See that my photo is deleted
*/
  casper.thenOpen(BASE_URL + '/myPhotos');

  casper.then(function() {
    var newSelfieCount = this.evaluate(function() {
      return $('.selfie').size();
    });
    var expectedSelfieCount = selfieCountBeforeDeleting - 1;
    test.assertEquals(newSelfieCount, expectedSelfieCount);
  });

  casper.run(function() {
    test.done();
  });
});
