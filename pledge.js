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

function $Promise() {
    this.state = "pending";
    this.value = undefined;
    this.handlerGroups = [];
}

function Deferral() {
    this.$promise = new $Promise();
    this.$promise.deferral = this;
}

var defer = function() {
    return new Deferral();
};

Deferral.prototype.resolve = function(data) {
    if (data && this.$promise.state === 'pending') {
        this.$promise.value = data;
        this.$promise.state = "resolved";
    } else if (this.$promise.state === 'pending') {
        this.$promise.state = "resolved";
    }
    this.$promise.callHandlers();
};

Deferral.prototype.reject = function(err) {
    if (err && this.$promise.state === 'pending') {
        this.$promise.value = err;
        this.$promise.state = "rejected";
    } else if (this.$promise.state === 'pending') {
        this.$promise.state = "rejected";
    }
    this.$promise.callHandlers();
};

$Promise.prototype.then = function(successCb, errorCb) {
    var newPromise = new $Promise();
    if (typeof successCb === "function") {
        newPromise.successCb = successCb;
    } else {
        newPromise.successCb = false;
    }
    if (typeof errorCb === "function") {
        newPromise.errorCb = errorCb;
    } else {
        newPromise.errorCb = false;
    }

    this.handlerGroups.push(newPromise);
    this.callHandlers();
};

$Promise.prototype.callHandlers = function() {
    for (var h = 0; h < this.handlerGroups.length; h++) {
        handler = this.handlerGroups[h];
        if (this.state === "resolved") {
            if (handler.state === "pending") {
                if (handler.successCb) {
                    handler.successCb(this.value);
                    handler.state = "resolved";
                }

            }
        } else if (this.state === 'rejected') {
            if (handler.state === 'pending') {
                if (handler.errorCb) {
                    handler.errorCb(this.value);
                    handler.state = "resolved";
                }
            }
        }
    }

    for (var h = 0; h < this.handlerGroups.length; h++) {
        if (this.handlerGroups[h].state === 'resolved') {
            this.handlerGroups.splice(h, 1);
        }

    }

};


$Promise.prototype.catch = function(errorHandler) {
    this.then(null, errorHandler);
};