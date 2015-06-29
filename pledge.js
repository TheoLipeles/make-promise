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
    this.returnPromise = null;
}

function Deferral() {
    this.$promise = new $Promise();
    this.$promise.forwarder = this;
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
    // if (this.$promise.value instanceof $Promise) {
    //     this.$promise = this.$promise.value;
    //     console.log(this.$promise);
    // }
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
    var deferral = new Deferral();
    var handlerGroup = {
        successCb: typeof successCb === 'function' ? successCb : null,
        errorCb: typeof errorCb === 'function' ? errorCb : null,
        forwarder: deferral
    };
    this.handlerGroups.push(handlerGroup);
    this.callHandlers();
    return deferral.$promise;
};

$Promise.prototype.callHandlers = function() {
    var s;
    for (var h = 0; h < this.handlerGroups.length; h++) {
        handler = this.handlerGroups[h];
        if (this.state === "resolved") {
            if (handler.forwarder.$promise.state === "pending") {
                if (handler.successCb) {
                    try {
                        s = handler.successCb(this.value);
                    } catch (err) {
                        handler.forwarder.reject(err);
                    }
                    if (s && s instanceof $Promise) {

                        s.then(function(value) {
                            console.log(handler.forwarder);
                            handler.forwarder.resolve(value);

                        });

                        s = null;

                    } else {
                        handler.forwarder.resolve(s);
                    }
                } else {
                    handler.forwarder.resolve(this.value);
                }

            }
        } else if (this.state === 'rejected') {
            if (handler.forwarder.$promise.state === 'pending') {
                if (handler.errorCb) {
                    var e;
                    try {
                        e = handler.errorCb(this.value);
                    } catch (err) {
                        handler.forwarder.reject(err);
                    }
                    if (e) {
                        handler.forwarder.resolve(e);
                    } else {
                        handler.forwarder.reject(this.value);
                    }
                } else {
                    handler.forwarder.reject(this.value);
                }
            }
        }
    }

    for (h = 0; h < this.handlerGroups.length; h++) {
        if (this.handlerGroups[h].forwarder.$promise.state === 'resolved') {
            this.handlerGroups.splice(h, 1);
        }

    }

};


$Promise.prototype.catch = function(errorHandler) {
    return this.then(null, errorHandler);
};