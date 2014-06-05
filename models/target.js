var mongoose = require('mongoose');
var user = require('./user');
var selfie = require('./selfie');

var TargetPair = mongoose.model('Target', {
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  target: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: { type: String, default: "in progress" },
  value: { type: Number, default: 25 },
  timestamp: { type: Date, default: Date.now }
});


var generateNextTarget = function(ownerId, callback, quantity, data) {
  quantity = (typeof quantity === "undefined") ? 1: quantity;
  // $1 Find every user
    // $2 Find every selfie i took or am tagged in
      // $3 Eliminate from $1 every 'other' user tagged in $2
  user.Model.find(function(err, users) {
    var potentialTargets = [];
    users.map(function(user) {
      potentialTargets[user._id] = user;
    });
    
    delete potentialTargets[ownerId];
    
    selfie.findSelfiesFor(ownerId, function(err, selfies) {
      selfies.map(function(selfie) {
        var otherUser = (selfie.owner == ownerId) ? selfie.tagged : selfie.owner;
        delete potentialTargets[otherUser];
      });
      TargetPair.find({ owner: ownerId}, function(err, existingTargets) {
        existingTargets.map(function(xTarget) {
          delete potentialTargets[xTarget.target];
        });
        var targets = [];
        for (var target in potentialTargets) {
          targets.push(potentialTargets[target]);
        }
        
        newTargets = targets.slice(0, quantity);
        
        var counter = 0;
        if (newTargets.length > 0) {
          newTargets.map(function(targetUser) {
            var targetPair = new TargetPair({
              owner: ownerId,
              target: targetUser._id  
            });
            var cb = function() {};
            if (counter++ === 0) {
              cb = function(error) { callback(error, data); };
            }
            targetPair.save(cb);
          });
        }
        else {
          callback(err, data);
        }
      });      
    });
  });
};

var eliminateTarget = function(ownerId, targetId, callback) {
  var criteria = {
    owner: ownerId,
    target: targetId,
    status: "in progress"
  };
  TargetPair.findOne(criteria, function(err, targetPair) {
    if (err || targetPair === null) {
      callback(err, null);
      return;
    }
    var points = targetPair.value;
    targetPair.status = "complete";
    targetPair.save(function(err) {
      generateNextTarget(ownerId, callback, 1, points);
    });
  });
};

module.exports = {
  generateNextTarget: generateNextTarget,
  eliminateTarget: eliminateTarget
};
