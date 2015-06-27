/*----------------------------------------------------------------
Promises Workshop: build the pledge.js deferral-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:






/*-------------------------------------------------------
The spec was designed to work with Test'Em, so we don't
actually use module.exports. But here it is for reference:

module.exports = {
  defer: defer,
};

So in a Node-based project we could write things like this:

var pledge = require('pledge');
…
var myDeferral = pledge.defer();
var myPromise1 = myDeferral.$promise;
--------------------------------------------------------*/

function $Promise () {
    this.state = "pending";
    this.value = undefined;
    this.handlerGroups = [];
};

function Deferral () {
    this.$promise = new $Promise;
};

var defer = function() {
    return new Deferral(); 
};

Deferral.prototype.resolve = function(data) {
    if (data && this.$promise.state === 'pending') {
        this.$promise.value = data;
        this.$promise.state = "resolved";
    }
    else if (this.$promise.state === 'pending'){
    this.$promise.state = "resolved";
    }
}

Deferral.prototype.reject = function (err) {
    if (err && this.$promise.state === 'pending') {
        this.$promise.value = err;
        this.$promise.state = "rejected";
    }
    else if (this.$promise.state === 'pending'){
    this.$promise.state = "rejected"
    }
}






