module.exports.createClient = function(settings) {
  var MockKnoxClient = function(options) {
    this.options = options
  };
  return new MockKnoxClient(settings);
};
