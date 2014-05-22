var should = require('should');

describe( "firstTest", function() {
  it("should pass the basic test", function() {
    var subject = "Hella World";
    subject.should.equal("Hella World");
  });
});
