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
  var token = "fe4788dd07a506e5c4c662e636dc3f46";

  var imageUrl = "testimage";
  var taggedUserId;
  var taggedUserName;

/*
  Log in as Admin
*/
  casper.start(BASE_URL + '/admin');

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
  })

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
